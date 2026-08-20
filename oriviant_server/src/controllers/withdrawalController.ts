import { Request, Response } from 'express';
import { withdrawalService } from '../services/withdrawalService.js';

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
  }
};