import { Request, Response } from 'express';
import pool from '../config/db.js';
import { applyMovement } from '../services/ledgerService.js';
import { sendDepositApproved, sendDepositDenied } from '../services/emailService.js';

/**
 * Deposit requests for the admin queue.
 *
 * Defaults to PENDING (the actionable queue) but accepts ?status=ALL or a
 * specific status so the admin can review what was already approved or denied.
 */
export const getPendingDeposits = async (req: Request, res: Response) => {
  try {
    const requested = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
    const allowed = ['PENDING', 'APPROVED', 'DENIED'];

    const filterByStatus = allowed.includes(requested);
    if (!filterByStatus && requested !== 'ALL') {
      return res.status(400).json({ success: false, error: 'Invalid status filter' });
    }

    const query = `
      SELECT dr.*, u.email, u.nickname
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      ${filterByStatus ? 'WHERE dr.status = $1' : ''}
      ORDER BY dr.created_at DESC
      LIMIT 200;
    `;
    const result = await pool.query(query, filterByStatus ? [requested] : []);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Everyone using the platform, with their holdings and deposit activity.
 *
 * Balances are aggregated in SQL rather than looped in JS to avoid an N+1 as
 * the user table grows.
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query = `
      SELECT
        u.id,
        u.email,
        u.nickname,
        u.role,
        u.created_at,
        COALESCE(w.asset_count, 0)        AS asset_count,
        COALESCE(w.holdings, '[]'::json)  AS holdings,
        COALESCE(d.deposit_count, 0)      AS deposit_count,
        COALESCE(d.pending_count, 0)      AS pending_count,
        d.last_deposit_at
      FROM users u
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*) FILTER (WHERE balance > 0) AS asset_count,
          json_agg(
            json_build_object('asset', asset_symbol, 'balance', balance)
            ORDER BY balance DESC
          ) FILTER (WHERE balance > 0) AS holdings
        FROM wallets
        GROUP BY user_id
      ) w ON w.user_id = u.id
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*)                                        AS deposit_count,
          COUNT(*) FILTER (WHERE status = 'PENDING')      AS pending_count,
          MAX(created_at)                                 AS last_deposit_at
        FROM deposit_requests
        GROUP BY user_id
      ) d ON d.user_id = u.id
      ${search ? 'WHERE u.email ILIKE $1 OR u.nickname ILIKE $1' : ''}
      ORDER BY u.created_at DESC
      LIMIT 200;
    `;

    const result = await pool.query(query, search ? [`%${search}%`] : []);
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Headline counters for the admin dashboard.
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)                                          AS total_users,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_7d,
        (SELECT COUNT(*) FROM deposit_requests WHERE status = 'PENDING')      AS pending_deposits,
        (SELECT COUNT(*) FROM deposit_requests WHERE status = 'APPROVED')     AS approved_deposits,
        (SELECT COUNT(*) FROM wallets WHERE balance > 0)                      AS funded_wallets;
    `);

    // Held balances are per-asset; converting to a single fiat total needs a
    // price feed the payouts work will introduce, so report them separately.
    const byAsset = await pool.query(`
      SELECT asset_symbol, SUM(balance) AS total
      FROM wallets
      WHERE balance > 0
      GROUP BY asset_symbol
      ORDER BY asset_symbol;
    `);

    res.status(200).json({
      success: true,
      data: { ...result.rows[0], balances_by_asset: byAsset.rows },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const approveDeposit = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const depositId = req.params.id;
    // The admin types the amount that actually landed on-chain, which may differ
    // from what the user claimed they sent. What we credit is this number.
    const amountReceived = Number(req.body?.amount_received);

    if (!Number.isFinite(amountReceived) || amountReceived <= 0) {
      return res
        .status(400)
        .json({ success: false, error: 'A positive amount_received is required to approve.' });
    }

    await client.query('BEGIN');

    // 1. Get the pending deposit
    const depositQuery = `SELECT * FROM deposit_requests WHERE id = $1 AND status = 'PENDING' FOR UPDATE;`;
    const depositResult = await client.query(depositQuery, [depositId]);

    if (depositResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pending deposit request not found.' });
    }

    const deposit = depositResult.rows[0];

    // 2. Update deposit status to APPROVED.
    //    amount_credited is written alongside amount_expected rather than over
    //    it: the gap between what the user claimed and what actually arrived is
    //    exactly what a later dispute turns on.
    await client.query(
      `UPDATE deposit_requests
       SET status = 'APPROVED',
           amount_credited = $1,
           reviewed_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [amountReceived, req.user?.id ?? null, depositId]
    );

    // 3. Credit the wallet through the ledger so the deposit appears in the
    //    user's balance history alongside their trades. Crediting directly here
    //    would leave a balance that its own history cannot account for.
    const balanceAfter = await applyMovement({
      client,
      userId: deposit.user_id,
      asset: deposit.asset,
      delta: amountReceived,
      reason: 'DEPOSIT_APPROVED',
      refType: 'deposit',
      refId: depositId,
      metadata: { approvedBy: req.user?.email, claimed: deposit.amount_expected },
    });

    await client.query('COMMIT');

    // Only after the money is committed, and never awaited into the response:
    // the credit is done whether or not the mail server is having a good day.
    const depositor = await pool.query('SELECT email FROM users WHERE id = $1', [deposit.user_id]);
    if (depositor.rows[0]?.email) {
      void sendDepositApproved(depositor.rows[0].email, amountReceived, deposit.asset);
    }

    res.status(200).json({
      success: true,
      message: `Credited ${amountReceived} ${deposit.asset}.`,
      data: {
        user_id: deposit.user_id,
        asset_symbol: deposit.asset,
        balance: balanceAfter,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving deposit:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const denyDeposit = async (req: Request, res: Response) => {
  try {
    const depositId = req.params.id;

    const query = `
      UPDATE deposit_requests
      SET status = 'DENIED', reviewed_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'PENDING'
      RETURNING *;
    `;
    const result = await pool.query(query, [depositId, req.user?.id ?? null]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pending deposit request not found.' });
    }

    const denied = result.rows[0];
    const depositor = await pool.query('SELECT email FROM users WHERE id = $1', [denied.user_id]);
    if (depositor.rows[0]?.email) {
      void sendDepositDenied(depositor.rows[0].email, denied.asset);
    }

    res.status(200).json({ success: true, message: 'Deposit denied.' });
  } catch (error) {
    console.error('Error denying deposit:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
