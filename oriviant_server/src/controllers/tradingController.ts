import { Request, Response } from 'express';
import pool from '../config/db.js';
import { placeOrder, cancelOrder, TradeError, FEE_RATE } from '../services/tradingService.js';
import { PriceUnavailableError, getMarketPrice } from '../services/priceOracle.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { pair, side, type, amount, limit_price } = req.body ?? {};

    if (typeof pair !== 'string' || !pair.includes('/')) {
      return res.status(400).json({ success: false, error: 'A trading pair like BTC/USDT is required.' });
    }

    // Note: any price in the request body is ignored for market orders. The
    // execution price comes from the server-side oracle.
    const result = await placeOrder({
      userId,
      pair: pair.toUpperCase(),
      side,
      type,
      amount: Number(amount),
      limitPrice: limit_price === undefined ? undefined : Number(limit_price),
    });

    res.status(201).json({
      success: true,
      message: result.filled
        ? `Order filled at ${Number(result.order.fill_price)} ${result.order.quote_asset}.`
        : 'Limit order placed. Funds are reserved until it fills or you cancel it.',
      data: result.order,
    });
  } catch (error) {
    if (error instanceof TradeError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    if (error instanceof PriceUnavailableError) {
      return res.status(503).json({ success: false, error: error.message });
    }
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
    res.status(200).json({ success: true, message: 'Order cancelled.', data: order });
  } catch (error) {
    if (error instanceof TradeError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * The caller's orders. ?status=OPEN drives the "open orders" panel;
 * omitting it returns recent history.
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : null;
    const allowed = ['OPEN', 'FILLED', 'CANCELLED'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status filter.' });
    }

    const result = await pool.query(
      `
      SELECT id, pair, base_asset, quote_asset, side, type,
             limit_price::text, amount::text, fill_price::text,
             fee::text, fee_asset, locked_amount::text, status,
             created_at, updated_at
      FROM orders
      WHERE user_id = $1 ${status ? 'AND status = $2' : ''}
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      status ? [userId, status] : [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Lets the client show the exact price and fee a market order would execute at,
 * so the confirmation dialog matches what actually happens.
 */
export const quoteOrder = async (req: Request, res: Response) => {
  try {
    const pair = typeof req.query.pair === 'string' ? req.query.pair.toUpperCase() : '';
    if (!pair.includes('/')) {
      return res.status(400).json({ success: false, error: 'A trading pair is required.' });
    }

    const price = await getMarketPrice(pair);
    res.status(200).json({ success: true, data: { pair, price, feeRate: FEE_RATE } });
  } catch (error) {
    if (error instanceof PriceUnavailableError) {
      return res.status(503).json({ success: false, error: error.message });
    }
    console.error('Error quoting order:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
