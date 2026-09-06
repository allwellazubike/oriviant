import { Request, Response } from 'express';
import { withdrawalService } from '../services/withdrawalService.js';
import { notifyWithdrawalPending, notifyWithdrawalCompleted, notifyWithdrawalRejected } from '../services/notificationService.js';
import { logAudit } from '../services/adminService.js';
import { sendWithdrawalPendingEmail, sendWithdrawalCompletedEmail, sendWithdrawalRejectedEmail } from '../services/emailService.js';
import pool from '../config/db.js';

export const withdrawalController = {
  requestWithdrawal: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { asset, amount, network, recipient_address, nickname } = req.body;
      if (!asset || !amount || !network || !recipient_address) {
        return res.status(400).json({ success: false, error: 'Missing required withdrawal fields' });
      }

      const withdrawal = await withdrawalService.requestWithdrawal(
        userId,
        asset,
        Number(amount),
        network,
        recipient_address,
        nickname
      );

      void notifyWithdrawalPending(userId, asset, Number(amount));

      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0 && userRes.rows[0].email) {
        void sendWithdrawalPendingEmail(userRes.rows[0].email, amount, asset);
      }

      return res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        withdrawal
      });
    } catch (err: any) {
      console.error('Withdrawal submission error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to process withdrawal' });
    }
  },

  getWithdrawals: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const withdrawals = await withdrawalService.getUserWithdrawals(userId);
      return res.status(200).json({ success: true, withdrawals });
    } catch (err: any) {
      console.error('Get withdrawals error:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve withdrawals' });
    }
  },

  approveWithdrawal: async (req: Request, res: Response) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const withdrawalId = Number(req.params.id);
      const { tx_hash } = req.body;

      if (!withdrawalId || !tx_hash) {
        return res.status(400).json({ success: false, error: 'Invalid ID or missing transaction hash' });
      }

      const withdrawal = await withdrawalService.approveWithdrawal(withdrawalId, adminId, tx_hash);
      void notifyWithdrawalCompleted(withdrawal.user_id, withdrawal.asset, Number(withdrawal.amount));

      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [withdrawal.user_id]);
      if (userRes.rows.length > 0 && userRes.rows[0].email) {
        void sendWithdrawalCompletedEmail(userRes.rows[0].email, withdrawal.amount, withdrawal.asset);
      }

      void logAudit(adminId, 'APPROVE_WITHDRAWAL', 'withdrawal', withdrawalId.toString(), {
        asset: withdrawal.asset, amount: withdrawal.amount, txHash: tx_hash, userId: withdrawal.user_id
      }, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal approved successfully',
        withdrawal
      });
    } catch (err: any) {
      console.error('Withdrawal approval error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to approve withdrawal' });
    }
  },

  denyWithdrawal: async (req: Request, res: Response) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const withdrawalId = Number(req.params.id);
      const { notes } = req.body;

      if (!withdrawalId) {
        return res.status(400).json({ success: false, error: 'Invalid withdrawal ID' });
      }

      const withdrawal = await withdrawalService.denyWithdrawal(withdrawalId, adminId, notes || 'Rejected by admin');
      void notifyWithdrawalRejected(withdrawal.user_id, withdrawal.asset, Number(withdrawal.amount));

      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [withdrawal.user_id]);
      if (userRes.rows.length > 0 && userRes.rows[0].email) {
        void sendWithdrawalRejectedEmail(userRes.rows[0].email, withdrawal.amount, withdrawal.asset);
      }

      void logAudit(adminId, 'DENY_WITHDRAWAL', 'withdrawal', withdrawalId.toString(), {
        asset: withdrawal.asset, amount: withdrawal.amount, notes, userId: withdrawal.user_id
      }, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal denied and funds released',
        withdrawal
      });
    } catch (err: any) {
      console.error('Withdrawal denial error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to deny withdrawal' });
    }
  }
};