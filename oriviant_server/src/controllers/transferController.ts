import { Request, Response } from 'express';
import { transferService } from '../services/transferService.js';

export const transferController = {
  transferFunds: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { asset, amount, from_wallet, to_wallet } = req.body;

      if (!asset || !amount || !from_wallet || !to_wallet) {
        return res.status(400).json({ success: false, error: 'Missing required transfer fields.' });
      }

      const transfer = await transferService.executeTransfer(
        userId,
        asset,
        Number(amount),
        from_wallet.toUpperCase(),
        to_wallet.toUpperCase()
      );

      return res.status(200).json({
        success: true,
        message: `Successfully transferred ${amount} ${asset} from ${from_wallet} to ${to_wallet}`,
        transfer
      });
    } catch (err: any) {
      console.error('Transfer execution error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Transfer failed.' });
    }
  },

  getHistory: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const transfers = await transferService.getTransferHistory(userId);
      return res.status(200).json({ success: true, transfers });
    } catch (err: any) {
      console.error('Get transfer history error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch transfer history.' });
    }
  }
};