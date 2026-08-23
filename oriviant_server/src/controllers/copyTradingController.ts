import { Request, Response } from 'express';
import {
  listTraders,
  listTradersForAdmin,
  setTraderStatus,
  traderPerformance,
  traderTrades,
  followTrader,
  stopCopying,
  listSubscriptions,
  listPositions,
  CopyTradeError,
  AdminCopyTraderError,
} from '../services/copyTradingService.js';
import { logAudit } from '../services/adminService.js';

const handle = (error: unknown, res: Response, context: string) => {
  if (error instanceof CopyTradeError || error instanceof AdminCopyTraderError) {
    return res.status(error.status).json({ success: false, error: error.message });
  }
  console.error(`Error ${context}:`, error);
  res.status(500).json({ success: false, error: 'Internal server error' });
};

export const getAdminTraders = async (_req: Request, res: Response) => {
  try {
    const traders = await listTradersForAdmin();
    res.status(200).json({ success: true, data: traders });
  } catch (error) {
    handle(error, res, 'listing traders for admin');
  }
};

export const patchTraderStatus = async (req: Request, res: Response) => {
  try {
    const traderId = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!traderId || typeof status !== 'string') {
      return res.status(400).json({ success: false, error: 'A trader id and status are required.' });
    }

    const trader = await setTraderStatus(traderId, status);
    void logAudit(req.user!.id, 'UPDATE_TRADER_STATUS', 'copy_trader', traderId.toString(), {
      handle: trader.handle, newStatus: status
    }, req.ip);
    res.status(200).json({ success: true, message: `Trader status set to ${status}.`, data: trader });
  } catch (error) {
    handle(error, res, 'updating trader status');
  }
};

export const getTraders = async (_req: Request, res: Response) => {
  try {
    const traders = await listTraders();

    const withCurves = await Promise.all(
      traders.map(async (t) => ({ ...t, performance_chart: await traderPerformance(t.id) }))
    );

    res.status(200).json({ success: true, data: withCurves });
  } catch (error) {
    handle(error, res, 'listing traders');
  }
};

export const getTrader = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: 'Invalid trader id.' });
    }

    const traders = await listTraders();
    const trader = traders.find((t) => t.id === id);
    if (!trader) return res.status(404).json({ success: false, error: 'Trader not found.' });

    res.status(200).json({
      success: true,
      data: {
        ...trader,
        performance_chart: await traderPerformance(id, 90),
        trades: await traderTrades(id),
      },
    });
  } catch (error) {
    handle(error, res, 'loading trader');
  }
};

export const postFollow = async (req: Request, res: Response) => {
  try {
    // FIX: Extract the exact properties sent by the frontend payload
    const { master_trader_id, allocation_amount, stop_loss_pct } = req.body ?? {};
    
    const sub = await followTrader(
      req.user!.id,
      Number(master_trader_id),
      Number(allocation_amount),
      stop_loss_pct === undefined ? undefined : Number(stop_loss_pct)
    );

    res.status(201).json({
      success: true,
      message: 'You are now copying this trader. New positions they open will be mirrored to your account.',
      data: sub,
    });
  } catch (error) {
    handle(error, res, 'following trader');
  }
};

export const deleteFollow = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription id.' });
    }

    const { closed } = await stopCopying(req.user!.id, id);
    res.status(200).json({
      success: true,
      message: closed > 0
        ? `Stopped copying. ${closed} open position${closed === 1 ? '' : 's'} closed at market.`
        : 'Stopped copying.',
    });
  } catch (error) {
    handle(error, res, 'stopping copy');
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, data: await listSubscriptions(req.user!.id) });
  } catch (error) {
    handle(error, res, 'listing subscriptions');
  }
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, data: await listPositions(req.user!.id) });
  } catch (error) {
    handle(error, res, 'listing positions');
  }
};