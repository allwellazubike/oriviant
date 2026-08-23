import { Request, Response } from 'express';
import pool from '../config/db.js';

export const getWallets = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await pool.query(
      `
      SELECT asset_symbol,
             COALESCE(wallet_type, 'spot') AS wallet_type,
             balance::text,
             locked::text,
             (balance - locked)::text AS available,
             updated_at
      FROM wallets
      WHERE user_id = $1
      ORDER BY asset_symbol, wallet_type;
      `,
      [userId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getLedger = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const asset = typeof req.query.asset === 'string' ? req.query.asset.toUpperCase() : null;

    const result = await pool.query(
      `
      SELECT id, asset_symbol, delta::text, balance_after::text,
             reason, ref_type, ref_id, metadata, created_at
      FROM ledger_entries
      WHERE user_id = $1 ${asset ? 'AND asset_symbol = $2' : ''}
      ORDER BY created_at DESC, id DESC
      LIMIT 200;
      `,
      asset ? [userId, asset] : [userId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Bulletproof transfer engine supporting all frontend parameter variations
export const transferFunds = async (req: Request, res: Response) => {
  console.log('📥 TRANSFER REQUEST RECEIVED:', req.body);
  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    
    // Accept multiple possible naming conventions from the frontend
    const asset = req.body.asset || req.body.symbol || req.body.assetSymbol;
    const amount = Number(req.body.amount);
    const from_type = req.body.from_type || req.body.fromWallet || req.body.from;
    const to_type = req.body.to_type || req.body.toWallet || req.body.to;

    if (!asset || isNaN(amount) || amount <= 0 || !from_type || !to_type || from_type === to_type) {
      console.warn('⚠️ Invalid transfer parameters received:', req.body);
      return res.status(400).json({ success: false, error: 'Invalid transfer parameters.' });
    }

    const cleanAsset = String(asset).split(' ')[0].toUpperCase();
    const fromTypeStr = String(from_type).toLowerCase();
    const toTypeStr = String(to_type).toLowerCase();

    await client.query('BEGIN');

    // 1. Check source wallet balance
    const fromRes = await client.query(
      `SELECT id, balance, locked FROM wallets 
       WHERE user_id = $1 AND UPPER(asset_symbol) = $2 AND LOWER(COALESCE(wallet_type, 'spot')) = $3 FOR UPDATE`,
      [userId, cleanAsset, fromTypeStr]
    );

    const fromWallet = fromRes.rows[0];
    if (!fromWallet || (Number(fromWallet.balance) - Number(fromWallet.locked)) < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: `Insufficient available balance in ${from_type} wallet for ${cleanAsset}.` });
    }

    // 2. Deduct from source wallet
    await client.query(
      `UPDATE wallets SET balance = balance - $1 WHERE id = $2`,
      [amount, fromWallet.id]
    );

    // 3. Check if destination wallet exists
    const toRes = await client.query(
      `SELECT id FROM wallets 
       WHERE user_id = $1 AND UPPER(asset_symbol) = $2 AND LOWER(COALESCE(wallet_type, 'spot')) = $3 FOR UPDATE`,
      [userId, cleanAsset, toTypeStr]
    );

    let newBalance = amount;
    if (toRes.rows.length > 0) {
      const updateRes = await client.query(
        `UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING balance`,
        [amount, toRes.rows[0].id]
      );
      newBalance = updateRes.rows[0].balance;
    } else {
      const insertRes = await client.query(
        `INSERT INTO wallets (user_id, asset_symbol, wallet_type, balance, locked) 
         VALUES ($1, $2, $3, $4, 0) RETURNING balance`,
        [userId, cleanAsset, toTypeStr, amount]
      );
      newBalance = insertRes.rows[0].balance;
    }

    // 4. Log movement in ledger
    await client.query(
      `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type)
       VALUES ($1, $2, $3, $4, 'INTERNAL_TRANSFER', 'transfer')`,
      [userId, cleanAsset, amount, newBalance]
    );

    await client.query('COMMIT');
    console.log(`✅ SUCCESSFULLY TRANSFERRED ${amount} ${cleanAsset} FROM ${fromTypeStr} TO ${toTypeStr}`);
    res.status(200).json({ success: true, message: `Successfully transferred ${amount} ${cleanAsset} to ${to_type}.` });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ TRANSFER EXECUTION ERROR:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server transfer failed.' });
  } finally {
    client.release();
  }
};