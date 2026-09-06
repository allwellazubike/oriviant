import { Request, Response } from 'express';
import pool from '../config/db.js';
import { placeOrder, cancelOrder, TradeError, FEE_RATE } from '../services/tradingService.js';
import { PriceUnavailableError, getMarketPrice } from '../services/priceOracle.js';
import { notifyOrderPlaced, notifyOrderFilled, notifyOrderCancelled } from '../services/notificationService.js';
import { adminService } from '../services/adminService.js';

export const createOrder = async (req: Request, res: Response) => {
  console.log('📥 INCOMING ORDER REQUEST:', req.body);
  try {
    if (await adminService.isMaintenanceModeActive()) {
      return res.status(503).json({ success: false, error: 'Trading is temporarily paused for platform maintenance. Please try again shortly.' });
    }

    const userId = req.user!.id;
    const body = req.body ?? {};

    const rawPair = body.pair || body.market_symbol || body.symbol || 'BTC/USDT';
    const rawSide = body.side || body.action || 'buy';
    const rawType = body.type || body.order_type || 'market';
    const amount = Number(body.amount ?? body.quantity ?? 0);
    const rawPrice = body.limit_price ?? body.price ?? 0;

    const pair = String(rawPair).toUpperCase();
    const side = String(rawSide).toLowerCase() as 'buy' | 'sell';
    const type = String(rawType).toLowerCase() as 'market' | 'limit';
    const limitPrice = Number(rawPrice) > 0 ? Number(rawPrice) : undefined;

    const result = await placeOrder({
      userId,
      pair,
      side,
      type,
      amount,
      limitPrice,
    });

    if (result.filled) {
      void notifyOrderFilled(userId, pair, side, Number(result.order.amount), Number(result.order.fill_price));
    } else {
      void notifyOrderPlaced(userId, pair, side, amount);
    }

    res.status(201).json({
      success: true,
      message: result.filled
        ? `Order filled at ${Number(result.order.fill_price)} ${result.order.quote_asset}.`
        : 'Limit order placed successfully.',
      data: result.order,
    });
  } catch (error: any) {
    console.error('❌ ORDER EXECUTION ERROR:', error);
    if (error instanceof TradeError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    if (error instanceof PriceUnavailableError) {
      return res.status(503).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ success: false, error: 'Invalid order id.' });
    }

    const order = await cancelOrder(userId, orderId);
    void notifyOrderCancelled(userId, order.pair, order.side, Number(order.amount));
    res.status(200).json({ success: true, message: 'Order cancelled.', data: order });
  } catch (error: any) {
    if (error instanceof TradeError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const market = typeof req.query.market === 'string' ? req.query.market.toUpperCase() : null;

    const result = await pool.query(
      `
      SELECT id, pair, base_asset, quote_asset, side, type,
             limit_price::text, amount::text, fill_price::text,
             fee::text, fee_asset, locked_amount::text, status,
             created_at, updated_at
      FROM orders
      WHERE user_id = $1 AND status = 'OPEN' ${market ? 'AND pair = $2' : ''}
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      market ? [userId, market] : [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching open orders:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getTradeHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const market = typeof req.query.market === 'string' ? req.query.market.toUpperCase() : null;

    const result = await pool.query(
      `
      SELECT id, pair, base_asset, quote_asset, side, type,
             limit_price::text, amount::text, fill_price::text,
             fee::text, fee_asset, locked_amount::text, status,
             created_at, updated_at
      FROM orders
      WHERE user_id = $1 ${market ? 'AND pair = $2' : ''}
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      market ? [userId, market] : [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const quoteOrder = async (req: Request, res: Response) => {
  try {
    const pair = typeof req.query.pair === 'string' ? req.query.pair.toUpperCase() : 'BTC/USDT';
    const price = await getMarketPrice(pair);
    res.status(200).json({ success: true, data: { pair, price, feeRate: FEE_RATE } });
  } catch (error: any) {
    if (error instanceof PriceUnavailableError) {
      return res.status(503).json({ success: false, error: error.message });
    }
    console.error('Error quoting order:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};