import pool from '../config/db.js';
import { getMarketPrice } from './priceOracle.js';
import {
  applyMovement,
  debitAvailable,
  lockFunds,
  unlockFunds,
  spendLockedFunds,
  InsufficientFundsError,
} from './ledgerService.js';

/** Taker fee, charged on the asset the user receives. */
export const FEE_RATE = 0.001; // 0.1%

export class TradeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'TradeError';
    this.status = status;
  }
}

export interface PlaceOrderInput {
  userId: number;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  limitPrice?: number;
}

const splitPair = (pair: string): { base: string; quote: string } => {
  const [base, quote] = pair.split('/');
  if (!base || !quote) throw new TradeError(`Invalid trading pair "${pair}".`);
  return { base: base.toUpperCase(), quote: quote.toUpperCase() };
};

/**
 * Rounds to 8 decimals — beyond Bitcoin's satoshi precision, and enough that
 * repeated trades do not accumulate dust the ledger cannot explain.
 */
const round = (value: number): string => value.toFixed(8);

/**
 * Executes a market order immediately at the oracle price, or rests a limit
 * order with its funds locked.
 *
 * Everything happens in one transaction: the debit, the credit, the fee, the
 * order row and the ledger entries commit together or not at all.
 */
export const placeOrder = async ({
  userId,
  pair,
  side,
  type,
  amount,
  limitPrice,
}: PlaceOrderInput) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new TradeError('Order amount must be a positive number.');
  }
  if (side !== 'buy' && side !== 'sell') {
    throw new TradeError('Order side must be "buy" or "sell".');
  }
  if (type !== 'market' && type !== 'limit') {
    throw new TradeError('Order type must be "market" or "limit".');
  }
  if (type === 'limit' && (!Number.isFinite(limitPrice!) || limitPrice! <= 0)) {
    throw new TradeError('Limit orders require a positive price.');
  }

  const { base, quote } = splitPair(pair);

  // Always the server's price. A price from the request body is untrusted input.
  const marketPrice = await getMarketPrice(pair);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (type === 'market') {
      const result = await executeFill({
        client,
        userId,
        pair,
        base,
        quote,
        side,
        type,
        amount,
        fillPrice: marketPrice,
      });
      await client.query('COMMIT');
      return result;
    }

    // ---- Limit order: lock the funds it would spend, then rest ----
    const price = limitPrice!;

    // A limit order that would fill instantly executes now rather than resting,
    // which is what every real exchange does with a marketable limit order.
    const marketable =
      (side === 'buy' && price >= marketPrice) || (side === 'sell' && price <= marketPrice);

    if (marketable) {
      const result = await executeFill({
        client,
        userId,
        pair,
        base,
        quote,
        side,
        type,
        amount,
        // Fill at the better of the two prices for the user, as an exchange would.
        fillPrice: marketPrice,
      });
      await client.query('COMMIT');
      return result;
    }

    const lockAsset = side === 'buy' ? quote : base;
    const lockAmount = side === 'buy' ? round(amount * price) : round(amount);

    // Ensure the wallet row exists so lockFunds has something to update.
    await client.query(
      `INSERT INTO wallets (user_id, asset_symbol, balance)
       VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
      [userId, lockAsset]
    );

    await lockFunds(client, userId, lockAsset, lockAmount);

    const order = await client.query(
      `
      INSERT INTO orders
        (user_id, pair, base_asset, quote_asset, side, type, limit_price, amount,
         locked_asset, locked_amount, status)
      VALUES ($1, $2, $3, $4, $5, 'limit', $6, $7, $8, $9, 'OPEN')
      RETURNING *;
      `,
      [userId, pair, base, quote, side, round(price), round(amount), lockAsset, lockAmount]
    );

    await client.query('COMMIT');
    return { order: order.rows[0], filled: false };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof InsufficientFundsError) throw new TradeError(error.message);
    throw error;
  } finally {
    client.release();
  }
};

interface FillInput {
  client: any;
  userId: number;
  pair: string;
  base: string;
  quote: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  fillPrice: number;
}

/**
 * Moves both legs of a trade and writes the order row.
 *
 * Buy:  debit quote (amount x price), credit base minus fee.
 * Sell: debit base, credit quote (amount x price) minus fee.
 * The fee is always taken from the asset being received.
 */
const executeFill = async ({
  client,
  userId,
  pair,
  base,
  quote,
  side,
  type,
  amount,
  fillPrice,
}: FillInput) => {
  const grossQuote = amount * fillPrice;

  const order = await client.query(
    `
    INSERT INTO orders
      (user_id, pair, base_asset, quote_asset, side, type, amount, fill_price, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'FILLED')
    RETURNING id;
    `,
    [userId, pair, base, quote, side, type, round(amount), round(fillPrice)]
  );
  const orderId = order.rows[0].id;

  let fee: number;
  let feeAsset: string;

  if (side === 'buy') {
    // Make sure the base wallet row exists before crediting into it.
    await client.query(
      `INSERT INTO wallets (user_id, asset_symbol, balance)
       VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
      [userId, base]
    );

    await debitAvailable(client, userId, quote, round(grossQuote), 'TRADE_BUY', 'order', orderId);

    fee = amount * FEE_RATE;
    feeAsset = base;
    await applyMovement({
      client,
      userId,
      asset: base,
      delta: round(amount - fee),
      reason: 'TRADE_BUY',
      refType: 'order',
      refId: orderId,
      metadata: { pair, fillPrice, grossAmount: round(amount), fee: round(fee) },
    });
  } else {
    await client.query(
      `INSERT INTO wallets (user_id, asset_symbol, balance)
       VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
      [userId, quote]
    );

    await debitAvailable(client, userId, base, round(amount), 'TRADE_SELL', 'order', orderId);

    fee = grossQuote * FEE_RATE;
    feeAsset = quote;
    await applyMovement({
      client,
      userId,
      asset: quote,
      delta: round(grossQuote - fee),
      reason: 'TRADE_SELL',
      refType: 'order',
      refId: orderId,
      metadata: { pair, fillPrice, grossQuote: round(grossQuote), fee: round(fee) },
    });
  }

  const updated = await client.query(
    `UPDATE orders SET fee = $1, fee_asset = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *;`,
    [round(fee), feeAsset, orderId]
  );

  return { order: updated.rows[0], filled: true };
};

/**
 * Cancels a resting order and releases its locked funds.
 *
 * Scoped to the caller's own id so one user cannot cancel another's order, and
 * guarded on status = 'OPEN' so a cancel racing a fill cannot double-release.
 */
export const cancelOrder = async (userId: number, orderId: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const found = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = 'OPEN' FOR UPDATE;`,
      [orderId, userId]
    );

    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new TradeError('Open order not found.', 404);
    }

    const order = found.rows[0];

    await unlockFunds(client, userId, order.locked_asset, order.locked_amount);
    await client.query(
      `UPDATE orders SET status = 'CANCELLED', locked_amount = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1;`,
      [orderId]
    );

    await client.query('COMMIT');
    return { ...order, status: 'CANCELLED' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Fills one resting order that the market has crossed.
 *
 * Re-reads the order FOR UPDATE inside the transaction: the sweep that selected
 * it may be acting on a snapshot where it was still open but has since been
 * cancelled or filled.
 */
const fillRestingOrder = async (orderId: number, marketPrice: number): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const found = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND status = 'OPEN' FOR UPDATE;`,
      [orderId]
    );
    if (found.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const order = found.rows[0];
    const amount = Number(order.amount);
    const price = Number(order.limit_price);

    // The user gets their limit price, which is the promise a limit order makes.
    const grossQuote = amount * price;

    if (order.side === 'buy') {
      await spendLockedFunds(
        client,
        order.user_id,
        order.quote_asset,
        round(grossQuote),
        'TRADE_BUY',
        'order',
        orderId
      );

      await client.query(
        `INSERT INTO wallets (user_id, asset_symbol, balance)
         VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
        [order.user_id, order.base_asset]
      );

      const fee = amount * FEE_RATE;
      await applyMovement({
        client,
        userId: order.user_id,
        asset: order.base_asset,
        delta: round(amount - fee),
        reason: 'TRADE_BUY',
        refType: 'order',
        refId: orderId,
        metadata: { pair: order.pair, fillPrice: price, fee: round(fee) },
      });

      await client.query(
        `UPDATE orders SET status = 'FILLED', fill_price = $1, fee = $2, fee_asset = $3,
                           locked_amount = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4;`,
        [round(price), round(fee), order.base_asset, orderId]
      );
    } else {
      await spendLockedFunds(
        client,
        order.user_id,
        order.base_asset,
        round(amount),
        'TRADE_SELL',
        'order',
        orderId
      );

      await client.query(
        `INSERT INTO wallets (user_id, asset_symbol, balance)
         VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
        [order.user_id, order.quote_asset]
      );

      const fee = grossQuote * FEE_RATE;
      await applyMovement({
        client,
        userId: order.user_id,
        asset: order.quote_asset,
        delta: round(grossQuote - fee),
        reason: 'TRADE_SELL',
        refType: 'order',
        refId: orderId,
        metadata: { pair: order.pair, fillPrice: price, fee: round(fee) },
      });

      await client.query(
        `UPDATE orders SET status = 'FILLED', fill_price = $1, fee = $2, fee_asset = $3,
                           locked_amount = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4;`,
        [round(price), round(fee), order.quote_asset, orderId]
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Failed to fill resting order ${orderId}:`, (error as Error).message);
    return false;
  } finally {
    client.release();
  }
};

/**
 * Sweeps open limit orders and fills any the market has reached.
 *
 * This is the stand-in for an order book: there is no counterparty matching,
 * the platform fills against the live market price. Good enough for a venue
 * that quotes external prices, and it is what the UI already implies.
 */
export const processRestingOrders = async (): Promise<number> => {
  const open = await pool.query(
    `SELECT DISTINCT pair FROM orders WHERE status = 'OPEN';`
  );
  if (open.rows.length === 0) return 0;

  let fills = 0;

  for (const { pair } of open.rows) {
    let marketPrice: number;
    try {
      marketPrice = await getMarketPrice(pair);
    } catch {
      continue; // No trustworthy price for this pair right now; try next sweep.
    }

    const due = await pool.query(
      `
      SELECT id FROM orders
      WHERE status = 'OPEN' AND pair = $1
        AND ((side = 'buy'  AND limit_price >= $2::numeric)
          OR (side = 'sell' AND limit_price <= $2::numeric))
      ORDER BY created_at ASC;
      `,
      [pair, marketPrice]
    );

    for (const { id } of due.rows) {
      if (await fillRestingOrder(id, marketPrice)) fills += 1;
    }
  }

  return fills;
};
