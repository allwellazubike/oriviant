import { Request, Response } from 'express';
import { getQuotes, marketDataService } from '../services/marketDataService.js';
import pool from '../config/db.js';
import { logAudit } from '../services/adminService.js';

export const getMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quotes, fetchedAt, stale } = await getQuotes();
    const requested = typeof req.query.symbols === 'string' ? req.query.symbols : null;

    const data = requested
      ? requested
          .split(',')
          .map((s) => s.trim())
          .filter((s) => quotes[s])
          .reduce<Record<string, unknown>>((acc, s) => {
            acc[s] = quotes[s];
            return acc;
          }, {})
      : quotes;

    res.status(200).json({ success: true, stale, fetchedAt: new Date(fetchedAt).toISOString(), count: Object.keys(data).length, data });
  } catch (error) {
    console.error('Error serving market prices:', error);
    res.status(503).json({ success: false, error: 'Market data temporarily unavailable' });
  }
};

export const getQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const pair = (req.query.pair as string) || 'BTC-USD';
    const priceData = await marketDataService.fetchLivePrice(pair);
    res.status(200).json({ success: true, pair: priceData.symbol, price: priceData.price, feeRate: 0.001 });
  } catch (err: any) {
    console.error('Market quote error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate quote' });
  }
};

// --- NEW ADMIN CRUD ENDPOINTS FOR MARKET ASSETS ---

export const getAdminMarkets = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM market_assets ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const createMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, symbol, category, description, status, spotAvailable, futuresAvailable,
      copyTradingAvailable, demoAvailable, minOrder, maxOrder, tradingFee,
      leverageLimits, pricePrecision, qtyPrecision, isFeatured, isTrending, isNewListing
    } = req.body;

    const query = `
      INSERT INTO market_assets (
        name, symbol, category, description, status, spot_available, futures_available,
        copy_trading_available, demo_available, min_order, max_order, trading_fee,
        leverage_limits, price_precision, qty_precision, is_featured, is_trending, is_new_listing
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;
    const values = [
      name, symbol, category, description, status, spotAvailable, futuresAvailable,
      copyTradingAvailable, demoAvailable, minOrder, maxOrder, tradingFee,
      leverageLimits, pricePrecision, qtyPrecision, isFeatured, isTrending, isNewListing
    ];

    const result = await pool.query(query, values);
    void logAudit(req.user!.id, 'CREATE_MARKET_ASSET', 'market_asset', result.rows[0].id.toString(), { symbol, name, category }, req.ip);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, symbol, category, description, status, spotAvailable, futuresAvailable,
      copyTradingAvailable, demoAvailable, minOrder, maxOrder, tradingFee,
      leverageLimits, pricePrecision, qtyPrecision, isFeatured, isTrending, isNewListing
    } = req.body;

    const query = `
      UPDATE market_assets SET
        name = $1, symbol = $2, category = $3, description = $4, status = $5,
        spot_available = $6, futures_available = $7, copy_trading_available = $8,
        demo_available = $9, min_order = $10, max_order = $11, trading_fee = $12,
        leverage_limits = $13, price_precision = $14, qty_precision = $15,
        is_featured = $16, is_trending = $17, is_new_listing = $18
      WHERE id = $19 RETURNING *;
    `;
    const values = [
      name, symbol, category, description, status, spotAvailable, futuresAvailable,
      copyTradingAvailable, demoAvailable, minOrder, maxOrder, tradingFee,
      leverageLimits, pricePrecision, qtyPrecision, isFeatured, isTrending, isNewListing, id
    ];

    const result = await pool.query(query, values);
    void logAudit(req.user!.id, 'UPDATE_MARKET_ASSET', 'market_asset', id, { symbol, name, category, status }, req.ip);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const deleteMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT symbol FROM market_assets WHERE id = $1', [id]);
    await pool.query('DELETE FROM market_assets WHERE id = $1', [id]);
    void logAudit(req.user!.id, 'DELETE_MARKET_ASSET', 'market_asset', id, { symbol: existing.rows[0]?.symbol }, req.ip);
    res.status(200).json({ success: true, message: 'Market deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const quickUpdateMarketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query('UPDATE market_assets SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    void logAudit(req.user!.id, 'UPDATE_MARKET_STATUS', 'market_asset', id, { symbol: result.rows[0]?.symbol, newStatus: status }, req.ip);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};