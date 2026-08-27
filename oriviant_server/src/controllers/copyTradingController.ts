import { Request, Response } from 'express';
import pool from '../config/db.js';
import {
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

export const postAdminTrader = async (req: Request, res: Response) => {
  try {
    const { name, handle: traderHandle, avatar, roi, winRate, aum, followers, riskScore, profitShare, strategy, badges } = req.body;
    
    if (!traderHandle || !name) {
      return res.status(400).json({ success: false, error: 'Trader name and handle are required.' });
    }

    const cleanHandle = traderHandle.replace('@', '');
    const isVerified = (badges || []).includes('Verified');

    const result = await pool.query(`
      INSERT INTO master_traders (
        handle, display_name, avatar_url, base_equity, 
        roi, win_rate, followers_count, max_followers, 
        risk_score, profit_share, strategy, verified, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE')
      RETURNING id, handle, display_name
    `, [
      cleanHandle, name, avatar || '', aum || 0, 
      roi || 0, winRate || 0, followers || 0, 500, 
      riskScore || 5, profitShare ? (profitShare / 100) : 0.1, strategy || '', isVerified
    ]);

    void logAudit(req.user!.id, 'CREATE_LEAD_TRADER', 'copy_trader', result.rows[0].id.toString(), {
      handle: cleanHandle, name
    }, req.ip);

    res.status(201).json({ success: true, message: 'Lead trader created successfully.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'A trader with this Handle already exists. Please use a unique handle.' });
    }
    handle(error, res, 'creating admin lead trader');
  }
};

export const putAdminTrader = async (req: Request, res: Response) => {
  try {
    const traderId = Number(req.params.id);
    if (!traderId) return res.status(400).json({ success: false, error: 'Trader ID required.' });

    const { name, handle: traderHandle, avatar, roi, winRate, aum, followers, riskScore, profitShare, strategy, badges } = req.body;
    const cleanHandle = traderHandle ? traderHandle.replace('@', '') : undefined;
    const isVerified = badges ? badges.includes('Verified') : false;

    const result = await pool.query(`
      UPDATE master_traders SET
        handle = COALESCE($1, handle),
        display_name = COALESCE($2, display_name),
        avatar_url = COALESCE($3, avatar_url),
        base_equity = COALESCE($4, base_equity),
        roi = COALESCE($5, roi),
        win_rate = COALESCE($6, win_rate),
        followers_count = COALESCE($7, followers_count),
        risk_score = COALESCE($8, risk_score),
        profit_share = COALESCE($9, profit_share),
        strategy = COALESCE($10, strategy),
        verified = COALESCE($11, verified),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING id, handle, display_name
    `, [
      cleanHandle, name, avatar || '', aum, 
      roi, winRate, followers, 
      riskScore, profitShare ? (profitShare / 100) : 0.1, strategy || '', isVerified, traderId
    ]);

    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Trader not found.' });

    void logAudit(req.user!.id, 'UPDATE_LEAD_TRADER', 'copy_trader', traderId.toString(), {
      handle: cleanHandle, name
    }, req.ip);

    res.status(200).json({ success: true, message: 'Trader updated successfully.', data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'A trader with this Handle already exists.' });
    }
    handle(error, res, 'updating admin lead trader');
  }
};

export const deleteAdminTrader = async (req: Request, res: Response) => {
  try {
    const traderId = Number(req.params.id);
    if (!traderId) {
      return res.status(400).json({ success: false, error: 'Trader ID required.' });
    }

    await pool.query('DELETE FROM master_traders WHERE id = $1', [traderId]);
    
    void logAudit(req.user!.id, 'DELETE_LEAD_TRADER', 'copy_trader', traderId.toString(), {}, req.ip);

    res.status(200).json({ success: true, message: 'Trader deleted successfully.' });
  } catch (error) {
    handle(error, res, 'deleting admin lead trader');
  }
};

export const getAdminTraders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM master_traders ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    handle(error, res, 'listing traders for admin');
  }
};

// 🔥 FIX: Changed "created_at" to "started_at" to perfectly match your database schema!
export const getAllSubscriptionsAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.follower_id,
        s.trader_id,
        s.allocated,
        s.status,
        s.started_at,
        t.display_name as trader_name
      FROM copy_subscriptions s
      LEFT JOIN master_traders t ON s.trader_id = t.id
      ORDER BY s.started_at DESC
    `);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    // 🚨 Safe logging: if it fails, it prints the EXACT SQL error in your terminal
    console.error("🔥 SQL CRASH IN ADMIN SUBSCRIPTIONS:", error.message);
    handle(error, res, 'fetching global subscriptions');
  }
};

// 🔥 FIX: Removed "updated_at" from the UPDATE to prevent any other hidden schema crashes
export const patchSubscriptionAdmin = async (req: Request, res: Response) => {
  try {
    const subId = Number(req.params.id);
    const { allocated_amount } = req.body;

    if (!subId || !allocated_amount) {
      return res.status(400).json({ success: false, error: 'Subscription ID and new allocation required.' });
    }

    const result = await pool.query(`
      UPDATE copy_subscriptions 
      SET allocated = $1
      WHERE id = $2 RETURNING *
    `, [allocated_amount, subId]);

    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Subscription not found.' });

    void logAudit(req.user!.id, 'BOOST_SUBSCRIPTION', 'copy_trader', subId.toString(), { newAllocation: allocated_amount }, req.ip);

    res.status(200).json({ success: true, message: 'Subscription boosted successfully', data: result.rows[0] });
  } catch (error: any) {
    console.error("🔥 SQL CRASH IN BOOST SUBSCRIPTION:", error.message);
    handle(error, res, 'boosting subscription');
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
    const result = await pool.query('SELECT * FROM master_traders WHERE UPPER(status) = $1 ORDER BY created_at DESC', ['ACTIVE']);
    const traders = result.rows;

    const withCurves = await Promise.all(
      traders.map(async (t) => {
        let chart: any[] = [];
        try { chart = await traderPerformance(t.id); } catch (e) { chart = []; }
        return { ...t, performance_chart: chart };
      })
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

    const result = await pool.query('SELECT * FROM master_traders WHERE id = $1', [id]);
    const trader = result.rows[0];
    
    if (!trader) return res.status(404).json({ success: false, error: 'Trader not found.' });

    let chart: any[] = [];
    let tradesList: any[] = [];
    
    try { chart = await traderPerformance(id, 90); } catch (e) { chart = []; }
    try { tradesList = await traderTrades(id); } catch (e) { tradesList = []; }

    res.status(200).json({
      success: true,
      data: {
        ...trader,
        performance_chart: chart,
        trades: tradesList,
      },
    });
  } catch (error) {
    handle(error, res, 'loading trader');
  }
};

export const postFollow = async (req: Request, res: Response) => {
  try {
    const { master_trader_id, allocation_amount, stop_loss_pct } = req.body ?? {};
    
    const rawId = String(master_trader_id || '').replace(/\D/g, '');
    const cleanTraderId = parseInt(rawId, 10);
    const cleanAmount = Number(allocation_amount);

    if (isNaN(cleanTraderId) || isNaN(cleanAmount) || cleanAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'A valid trader ID and allocation amount are required.' 
      });
    }

    const sub = await followTrader(
      req.user!.id,
      cleanTraderId,
      cleanAmount,
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