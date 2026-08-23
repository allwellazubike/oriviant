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

      // 2. Lock the funds (Increase locked balance instead of deducting from total balance)
      const newLocked = locked + amount;
      await client.query(
        'UPDATE wallets SET locked = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3',
        [newLocked, userId, asset]
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
         VALUES ($1, $2, $3, $4, 'WITHDRAWAL_LOCK', 'withdrawal', $5)`,
        [userId, asset, 0, balance, withdrawal.id] // delta 0 because total balance hasn't changed yet
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
  },

  approveWithdrawal: async (withdrawalId: number, adminId: number, txHash: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the withdrawal record
      const wthRes = await client.query('SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE', [withdrawalId]);
      if (wthRes.rows.length === 0) throw new Error('Withdrawal not found');
      const wth = wthRes.rows[0];

      if (wth.status !== 'PENDING') throw new Error('Withdrawal is not pending');

      // 2. Get the wallet to calculate new balances
      const walletRes = await client.query('SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 FOR UPDATE', [wth.user_id, wth.asset]);
      if (walletRes.rows.length === 0) throw new Error('Wallet not found');
      
      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const amount = Number(wth.amount);

      const newBalance = balance - amount;
      const newLocked = locked - amount;

      // 3. Permanently deduct from balance AND locked
      await client.query(
        'UPDATE wallets SET balance = $1, locked = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND asset_symbol = $4',
        [newBalance, newLocked, wth.user_id, wth.asset]
      );

      // 4. Update status
      const updatedWth = await client.query(
        `UPDATE withdrawals SET status = 'COMPLETED', tx_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [txHash, withdrawalId]
      );

      // 5. Record ledger entry for permanent deduction
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'WITHDRAWAL_APPROVED', 'withdrawal', $5)`,
        [wth.user_id, wth.asset, -amount, newBalance, withdrawalId]
      );

      await client.query('COMMIT');
      return updatedWth.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  denyWithdrawal: async (withdrawalId: number, adminId: number, notes: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the withdrawal record
      const wthRes = await client.query('SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE', [withdrawalId]);
      if (wthRes.rows.length === 0) throw new Error('Withdrawal not found');
      const wth = wthRes.rows[0];

      if (wth.status !== 'PENDING') throw new Error('Withdrawal is not pending');

      // 2. Get the wallet to release locked funds
      const walletRes = await client.query('SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 FOR UPDATE', [wth.user_id, wth.asset]);
      if (walletRes.rows.length === 0) throw new Error('Wallet not found');

      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const amount = Number(wth.amount);
      
      const newLocked = locked - amount;

      // 3. Release the locked funds back to available
      await client.query(
        'UPDATE wallets SET locked = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3',
        [newLocked, wth.user_id, wth.asset]
      );

      // 4. Update status to DENIED
      const updatedWth = await client.query(
        `UPDATE withdrawals SET status = 'DENIED', notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [notes, withdrawalId]
      );

      // 5. Record ledger entry for release
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'WITHDRAWAL_DENIED', 'withdrawal', $5)`,
        [wth.user_id, wth.asset, 0, balance, withdrawalId]
      );

      await client.query('COMMIT');
      return updatedWth.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};