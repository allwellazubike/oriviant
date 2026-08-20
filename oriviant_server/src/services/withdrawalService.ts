import pool from '../config/db.js';

export const withdrawalService = {
  requestWithdrawal: async (userId: number, asset: string, amount: number, network: string, recipientAddress: string, nickname?: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Check user wallet balance
      const walletRes = await client.query(
        'SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 FOR UPDATE',
        [userId, asset]
      );

      if (walletRes.rows.length === 0) {
        throw new Error('Wallet not found for this asset.');
      }

      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const spendable = balance - locked;

      const fee = 1.0; // Standard network fee
      const receiveAmount = amount - fee;

      if (amount <= 0 || receiveAmount <= 0) {
        throw new Error('Invalid withdrawal amount.');
      }

      if (spendable < amount) {
        throw new Error(`Insufficient spendable balance. Available: ${spendable} ${asset}`);
      }

      // 2. Deduct from wallet balance
      const newBalance = balance - amount;
      await client.query(
        'UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3',
        [newBalance, userId, asset]
      );

      // 3. Insert into withdrawals table
      const wthRes = await client.query(
        `INSERT INTO withdrawals (user_id, asset, amount, fee, receive_amount, network, recipient_address, address_nickname, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING') RETURNING *`,
        [userId, asset, amount, fee, receiveAmount, network, recipientAddress, nickname || null]
      );

      const withdrawal = wthRes.rows[0];

      // 4. Record ledger entry for auditing
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'WITHDRAWAL', 'withdrawal', $5)`,
        [userId, asset, -amount, newBalance, withdrawal.id]
      );

      await client.query('COMMIT');
      return withdrawal;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getUserWithdrawals: async (userId: number) => {
    const res = await pool.query(
      'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows;
  }
};