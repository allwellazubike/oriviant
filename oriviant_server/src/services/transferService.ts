import pool from '../config/db.js';

export const transferService = {
  executeTransfer: async (
    userId: number,
    asset: string,
    amount: number,
    fromWallet: 'SPOT' | 'FUTURES',
    toWallet: 'SPOT' | 'FUTURES'
  ) => {
    if (fromWallet === toWallet) {
      throw new Error('Source and destination wallets must be different.');
    }
    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than zero.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Check & Lock the source wallet balance
      const walletRes = await client.query(
        'SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 FOR UPDATE',
        [userId, asset]
      );

      if (walletRes.rows.length === 0) {
        throw new Error(`Wallet not found for asset ${asset}`);
      }

      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const spendable = balance - locked;

      if (spendable < amount) {
        throw new Error(`Insufficient spendable balance. Available: ${spendable} ${asset}`);
      }

      // 2. Record the internal transfer row
      const transferRes = await client.query(
        `INSERT INTO internal_transfers (user_id, asset_symbol, amount, from_wallet, to_wallet, status)
         VALUES ($1, $2, $3, $4, $5, 'COMPLETED') RETURNING *`,
        [userId, asset, amount, fromWallet, toWallet]
      );
      const transfer = transferRes.rows[0];

      // 3. Write Double-Entry Audit Trail into ledger_entries
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, $5, 'internal_transfer', $6)`,
        [
          userId,
          asset,
          fromWallet === 'SPOT' ? -amount : amount,
          balance,
          `TRANSFER_${fromWallet}_TO_${toWallet}`,
          transfer.id
        ]
      );

      await client.query('COMMIT');
      return transfer;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getTransferHistory: async (userId: number) => {
    const res = await pool.query(
      'SELECT * FROM internal_transfers WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows;
  }
};