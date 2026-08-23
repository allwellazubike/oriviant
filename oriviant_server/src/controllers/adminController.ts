import { Request, Response } from 'express';
import pool from '../config/db.js';
import { applyMovement } from '../services/ledgerService.js';
import { sendDepositApproved, sendDepositDenied } from '../services/emailService.js';
import { marketDataService } from '../services/marketDataService.js'; 
import { adminService } from '../services/adminService.js';

export const getPendingDeposits = async (req: Request, res: Response) => {
  try {
    const requested = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
    const allowed = ['PENDING', 'APPROVED', 'DENIED', 'COMPLETED'];

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

export const getPendingWithdrawals = async (req: Request, res: Response) => {
  try {
    const requested = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
    const allowed = ['PENDING', 'APPROVED', 'DENIED', 'COMPLETED', 'REJECTED'];

    const filterByStatus = allowed.includes(requested);
    if (!filterByStatus && requested !== 'ALL') {
      return res.status(400).json({ success: false, error: 'Invalid status filter' });
    }

    const query = `
      SELECT w.*, u.email, u.nickname
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      ${filterByStatus ? 'WHERE w.status = $1' : ''}
      ORDER BY w.created_at DESC
      LIMIT 200;
    `;
    const result = await pool.query(query, filterByStatus ? [requested] : []);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

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
          COUNT(*)                                                      AS deposit_count,
          COUNT(*) FILTER (WHERE status = 'PENDING')                      AS pending_count,
          MAX(created_at)                                                 AS last_deposit_at
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

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const aggregations = await adminService.getDashboardAggregations();
    
    res.status(200).json({
      success: true,
      stats: aggregations,
      data: aggregations
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
    const amountReceived = Number(req.body?.amount_received);

    if (!Number.isFinite(amountReceived) || amountReceived <= 0) {
      return res.status(400).json({ success: false, error: 'A positive amount_received is required to approve.' });
    }

    await client.query('BEGIN');

    const depositQuery = `SELECT * FROM deposit_requests WHERE id = $1 AND status = 'PENDING' FOR UPDATE;`;
    const depositResult = await client.query(depositQuery, [depositId]);

    if (depositResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pending deposit request not found.' });
    }

    const deposit = depositResult.rows[0];

    await client.query(
      `UPDATE deposit_requests
       SET status = 'APPROVED', amount_credited = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [amountReceived, req.user?.id ?? null, depositId]
    );

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

    const depositor = await pool.query('SELECT email FROM users WHERE id = $1', [deposit.user_id]);
    if (depositor.rows[0]?.email) {
      void sendDepositApproved(depositor.rows[0].email, amountReceived, deposit.asset);
    }

    res.status(200).json({
      success: true,
      message: `Credited ${amountReceived} ${deposit.asset}.`,
      data: { user_id: deposit.user_id, asset_symbol: deposit.asset, balance: balanceAfter },
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

export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const withdrawalId = req.params.id;
    const txHash = typeof req.body?.tx_hash === 'string' ? req.body.tx_hash.trim() : null;

    const query = `
      UPDATE withdrawals
      SET status = 'APPROVED',
          tx_hash = COALESCE($1, tx_hash),
          reviewed_by = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND status = 'PENDING'
      RETURNING *;
    `;
    const result = await pool.query(query, [txHash, req.user?.id ?? null, withdrawalId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pending withdrawal request not found.' });
    }

    const approved = result.rows[0];
    res.status(200).json({
      success: true,
      message: `Withdrawal of ${approved.amount} ${approved.asset} approved.`,
      data: approved,
    });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const denyWithdrawal = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const withdrawalId = req.params.id;

    await client.query('BEGIN');

    const wthQuery = `SELECT * FROM withdrawals WHERE id = $1 AND status = 'PENDING' FOR UPDATE;`;
    const wthResult = await client.query(wthQuery, [withdrawalId]);

    if (wthResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pending withdrawal request not found.' });
    }

    const withdrawal = wthResult.rows[0];

    await client.query(
      `UPDATE withdrawals
       SET status = 'DENIED', reviewed_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [req.user?.id ?? null, withdrawalId]
    );

    const refundAmount = Number(withdrawal.amount);
    const balanceAfter = await applyMovement({
      client,
      userId: withdrawal.user_id,
      asset: withdrawal.asset,
      delta: refundAmount,
      reason: 'WITHDRAWAL_DENIED_REFUND' as any,
      refType: 'withdrawal',
      refId: withdrawalId,
      metadata: { deniedBy: req.user?.email, reason: req.body?.reason || 'Administrative rejection' },
    });

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `Withdrawal denied and ${refundAmount} ${withdrawal.asset} refunded.`,
      data: { user_id: withdrawal.user_id, asset_symbol: withdrawal.asset, balance: balanceAfter },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error denying withdrawal:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const targetUserId = parseInt(req.params.id, 10);
    // FIX: Removed is_suspended to match the service update!
    const { vip_level, role } = req.body;

    const updatedUser = await adminService.updateUserStatus(adminId, targetUserId, {
      vip_level, role
    });

    return res.status(200).json({ success: true, message: 'User updated', user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await adminService.getAuditLogs();
    return res.status(200).json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getLedgerLogs = async (req: Request, res: Response) => {
  try {
    const logs = await adminService.getSystemLedgerLogs();
    return res.status(200).json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await adminService.getPlatformSettings();
    return res.status(200).json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const { key, value } = req.body;
    if (!key || !value) {
      return res.status(400).json({ success: false, error: 'Missing key or value' });
    }
    const updated = await adminService.updatePlatformSetting(adminId, key, value);
    return res.status(200).json({ success: true, message: 'Setting updated', setting: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const analytics = await adminService.getAnalyticsOverview();
    return res.status(200).json({ success: true, data: analytics });
  } catch (err: any) {
    console.error('Error fetching analytics overview:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getSystemTelemetry = async (req: Request, res: Response) => {
  try {
    const telemetry = marketDataService.getTelemetry();
    return res.status(200).json({ success: true, telemetry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};