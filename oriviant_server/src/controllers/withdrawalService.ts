import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * The caller's balances.
 *
 * `available` is what can actually be spent — balance minus anything locked
 * behind a resting order. The UI should spend against this, not `balance`.
 */
export const getWallets = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `
      SELECT asset_symbol,
             balance::text,
             locked::text,
             (balance - locked)::text AS available,
             updated_at
      FROM wallets
      WHERE user_id = $1
      ORDER BY asset_symbol;
      `,
      [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Balance history for the caller — the "why" behind the current number.
 */
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
