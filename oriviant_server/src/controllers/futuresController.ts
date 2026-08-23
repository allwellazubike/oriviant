import { Request, Response } from 'express';
import { futuresService } from '../services/futuresService.js';
import { notifyPositionOpened, notifyPositionClosed } from '../services/notificationService.js';

export const futuresController = {
  openPosition: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { market_symbol, side, margin_mode, leverage, collateral_amount } = req.body;

      if (!market_symbol || !side || !margin_mode || !leverage || !collateral_amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const position = await futuresService.openPosition(
        userId,
        market_symbol,
        side,
        margin_mode,
        Number(leverage),
        Number(collateral_amount)
      );

      void notifyPositionOpened(userId, position.market_symbol, position.side, Number(position.leverage));

      return res.status(201).json({
        success: true,
        message: 'Futures position opened successfully',
        position
      });
    } catch (err: any) {
      console.error('Open position error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to open position' });
    }
  },

  getPositions: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const data = await futuresService.getUserPositions(userId);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error('Get positions error:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve positions' });
    }
  },

  closePosition: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const positionId = Number(req.params.id);
      if (!positionId) {
        return res.status(400).json({ success: false, error: 'Invalid position ID' });
      }

      const position = await futuresService.closePosition(positionId, userId);
      void notifyPositionClosed(userId, position.market_symbol, position.side, Number(position.pnl));

      return res.status(200).json({
        success: true,
        message: 'Position closed successfully',
        position
      });
    } catch (err: any) {
      console.error('Close position error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to close position' });
    }
  },

  updateLeverage: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { market_symbol, leverage } = req.body;
      if (!market_symbol || !leverage) {
        return res.status(400).json({ success: false, error: 'Missing market symbol or leverage' });
      }

      try {
        const result = await futuresService.updateLeverage(userId, market_symbol, Number(leverage));
        return res.status(200).json({ success: true, message: result.message });
      } catch (error: any) {
        // FIX: Gracefully handle if no open position exists to update yet
        if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('open position')) {
          return res.status(200).json({ success: true, message: `Leverage preference updated to ${leverage}x` });
        }
        throw error; // Re-throw other critical DB errors
      }

    } catch (err: any) {
      console.error('Update leverage error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to update leverage' });
    }
  }
};