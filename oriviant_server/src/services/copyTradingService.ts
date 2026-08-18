import pool from '../config/db.js';
import type { PoolClient } from 'pg';
import { getMarketPrice } from './priceOracle.js';
import { applyMovement, debitAvailable, InsufficientFundsError } from './ledgerService.js';
import { FEE_RATE } from './tradingService.js';

/**
 * Copy trading.
 *
 * A follower allocates an amount to a leader. When that leader opens a
 * position, every active follower opens a proportional one; when the leader
 * closes it, every follower's copy closes. The follower's own wallet is
 * debited and credited through the same ledger as a manual trade, so a copied
 * trade is not a special kind of money — it is an ordinary spot fill that
 * happened to be triggered by someone else's decision.
 *
 * Sizing is proportional, never absolute: a leader committing 5% of their
 * equity causes each follower to commit 5% of *their* allocation. That is what
 * makes a $200 follower and a $200,000 follower take the same relative risk,
 * and it is how every real copy-trading venue works.
 */

/** Below this, a copied position is not worth the fees or the row. */
export const MIN_COPY_NOTIONAL = 1; // in quote asset (USDT)

export class CopyTradeError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CopyTradeError';
    this.status = status;
  }
}

const round = (v: number): string => v.toFixed(8);

/* ------------------------------------------------------------------ *
 * Subscriptions
 * ------------------------------------------------------------------ */

export const followTrader = async (
  followerId: number,
  traderId: number,
  allocated: number,
  stopLossPct?: number
) => {
  if (!Number.isFinite(allocated) || allocated <= 0) {
    throw new CopyTradeError('Allocation must be a positive amount.');
  }

  const trader = await pool.query(
    `SELECT id, display_name, status, max_followers FROM copy_traders WHERE id = $1`,
    [traderId]
  );
  if (trader.rows.length === 0) throw new CopyTradeError('Trader not found.', 404);
  if (trader.rows[0].status !== 'active') {
    throw new CopyTradeError('This trader is not accepting new copiers.');
  }

  const existing = await pool.query(
    `SELECT id FROM copy_subscriptions
     WHERE follower_id = $1 AND trader_id = $2 AND status = 'ACTIVE'`,
    [followerId, traderId]
  );
  if (existing.rows.length > 0) {
    throw new CopyTradeError('You are already copying this trader.', 409);
  }

  const followers = await pool.query(
    `SELECT COUNT(*)::int AS n FROM copy_subscriptions WHERE trader_id = $1 AND status = 'ACTIVE'`,
    [traderId]
  );
  if (followers.rows[0].n >= trader.rows[0].max_followers) {
    throw new CopyTradeError('This trader has reached their follower limit.');
  }

  /*
   * The allocation is checked against the wallet but deliberately NOT locked.
   *
   * Locking the whole allocation up front would freeze funds that may never be
   * deployed — a leader might commit 5% of equity at a time and never use the
   * rest. Each individual copied trade checks spendable balance at the moment
   * it fills, which is both more honest about what is committed and what a real
   * venue does. The cost is that a follower who spends the money elsewhere will
   * see copies skipped, which is reported to them on the subscription.
   */
  const wallet = await pool.query(
    `SELECT (balance - locked)::text AS available FROM wallets
     WHERE user_id = $1 AND asset_symbol = 'USDT'`,
    [followerId]
  );
  const available = Number(wallet.rows[0]?.available ?? 0);
  if (available < allocated) {
    throw new CopyTradeError(
      `You have ${available.toFixed(2)} USDT available but tried to allocate ${allocated.toFixed(2)}.`
    );
  }

  const created = await pool.query(
    `INSERT INTO copy_subscriptions (follower_id, trader_id, allocated, stop_loss_pct)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [followerId, traderId, round(allocated), stopLossPct ?? null]
  );

  return created.rows[0];
};

/**
 * Stops copying and closes every open copied position at market.
 *
 * Leaving positions open after unfollowing would strand a follower in trades
 * they can no longer see the reasoning for and whose exit nobody is watching.
 */
export const stopCopying = async (followerId: number, subscriptionId: number) => {
  const sub = await pool.query(
    `SELECT * FROM copy_subscriptions
     WHERE id = $1 AND follower_id = $2 AND status = 'ACTIVE'`,
    [subscriptionId, followerId]
  );
  if (sub.rows.length === 0) throw new CopyTradeError('Active subscription not found.', 404);

  const open = await pool.query(
    `SELECT * FROM copy_positions WHERE subscription_id = $1 AND status = 'OPEN'`,
    [subscriptionId]
  );

  let closed = 0;
  for (const position of open.rows) {
    try {
      await closeCopyPosition(position, await getMarketPrice(position.pair));
      closed += 1;
    } catch (error) {
      console.error(`[copy] Could not close position ${position.id}:`, (error as Error).message);
    }
  }

  await pool.query(
    `UPDATE copy_subscriptions SET status = 'STOPPED', stopped_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [subscriptionId]
  );

  return { closed };
};

/* ------------------------------------------------------------------ *
 * Replication
 * ------------------------------------------------------------------ */

/**
 * Opens one follower's copy of a leader trade.
 *
 * Runs in its own transaction per follower: one follower being short of funds
 * must not roll back the copies that already succeeded for everyone else.
 */
const openCopyPosition = async (
  sub: any,
  trade: any,
  price: number
): Promise<'opened' | 'skipped' | 'insufficient'> => {
  const quoteToSpend = Number(sub.allocated) * Number(trade.size_pct);
  if (!Number.isFinite(quoteToSpend) || quoteToSpend < MIN_COPY_NOTIONAL) return 'skipped';

  const quantity = quoteToSpend / price;
  const fee = quantity * FEE_RATE;
  const netQuantity = quantity - fee;

  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    await debitAvailable(
      client,
      sub.follower_id,
      trade.quote_asset,
      round(quoteToSpend),
      'TRADE_BUY',
      'copy_trade',
      trade.id
    );

    await client.query(
      `INSERT INTO wallets (user_id, asset_symbol, balance) VALUES ($1, $2, 0)
       ON CONFLICT (user_id, asset_symbol) DO NOTHING`,
      [sub.follower_id, trade.base_asset]
    );

    await applyMovement({
      client,
      userId: sub.follower_id,
      asset: trade.base_asset,
      delta: round(netQuantity),
      reason: 'TRADE_BUY',
      refType: 'copy_trade',
      refId: trade.id,
      metadata: { pair: trade.pair, price, fee: round(fee), copiedFrom: trade.trader_id },
    });

    await client.query(
      `INSERT INTO copy_positions
         (subscription_id, trader_trade_id, follower_id, pair, base_asset, quote_asset,
          quantity, entry_price, quote_spent, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN')
       ON CONFLICT (subscription_id, trader_trade_id) DO NOTHING`,
      [
        sub.id, trade.id, sub.follower_id, trade.pair, trade.base_asset, trade.quote_asset,
        round(netQuantity), round(price), round(quoteToSpend),
      ]
    );

    await client.query('COMMIT');
    return 'opened';
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof InsufficientFundsError) return 'insufficient';
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Closes one copied position at the given price and settles the profit share.
 *
 * The leader's cut is charged only on a gain, and only on the gain — never on
 * the principal, and never on a loss. Charging a performance fee on a losing
 * trade is the classic way these systems quietly eat a follower's balance.
 */
export const closeCopyPosition = async (position: any, price: number) => {
  const quantity = Number(position.quantity);
  const grossQuote = quantity * price;
  const tradingFee = grossQuote * FEE_RATE;
  const netQuote = grossQuote - tradingFee;
  const pnl = netQuote - Number(position.quote_spent);

  const share = await pool.query(
    `SELECT t.profit_share
     FROM copy_subscriptions s JOIN copy_traders t ON t.id = s.trader_id
     WHERE s.id = $1`,
    [position.subscription_id]
  );
  const profitShareRate = Number(share.rows[0]?.profit_share ?? 0);
  const profitShareFee = pnl > 0 ? pnl * profitShareRate : 0;
  const credited = netQuote - profitShareFee;

  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    await debitAvailable(
      client,
      position.follower_id,
      position.base_asset,
      round(quantity),
      'TRADE_SELL',
      'copy_trade',
      position.trader_trade_id
    );

    await applyMovement({
      client,
      userId: position.follower_id,
      asset: position.quote_asset,
      delta: round(credited),
      reason: 'TRADE_SELL',
      refType: 'copy_trade',
      refId: position.trader_trade_id,
      metadata: {
        pair: position.pair,
        price,
        tradingFee: round(tradingFee),
        profitShareFee: round(profitShareFee),
        pnl: round(pnl),
      },
    });

    await client.query(
      `UPDATE copy_positions
       SET status = 'CLOSED', exit_price = $1, quote_returned = $2, pnl = $3,
           profit_share_fee = $4, closed_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [round(price), round(credited), round(pnl), round(profitShareFee), position.id]
    );

    await client.query(
      `UPDATE copy_subscriptions
       SET realized_pnl = realized_pnl + $1::numeric,
           fees_paid = fees_paid + $2::numeric
       WHERE id = $3`,
      [round(pnl - profitShareFee), round(profitShareFee), position.subscription_id]
    );

    await client.query('COMMIT');
    return { pnl, profitShareFee, credited };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Publishes a new leader position and replicates it to every active follower.
 *
 * Returns per-follower outcomes so the caller (and the admin view) can see who
 * was copied and who was skipped for lack of funds.
 */
export const publishTraderTrade = async (opts: {
  traderId: number;
  pair: string;
  sizePct: number;
  price?: number;
}) => {
  const { traderId, pair, sizePct } = opts;
  const [base, quote] = pair.split('/');
  const price = opts.price ?? (await getMarketPrice(pair));

  const trade = await pool.query(
    `INSERT INTO copy_trader_trades
       (trader_id, pair, base_asset, quote_asset, side, size_pct, entry_price, status)
     VALUES ($1, $2, $3, $4, 'buy', $5, $6, 'OPEN')
     RETURNING *`,
    [traderId, pair, base.toUpperCase(), quote.toUpperCase(), sizePct, round(price)]
  );

  const result = await replicateOpen(trade.rows[0], price);
  return { trade: trade.rows[0], ...result };
};

export const replicateOpen = async (trade: any, price: number) => {
  const subs = await pool.query(
    `SELECT * FROM copy_subscriptions WHERE trader_id = $1 AND status = 'ACTIVE'`,
    [trade.trader_id]
  );

  let opened = 0;
  let insufficient = 0;
  let skipped = 0;

  for (const sub of subs.rows) {
    const outcome = await openCopyPosition(sub, trade, price);
    if (outcome === 'opened') opened += 1;
    else if (outcome === 'insufficient') insufficient += 1;
    else skipped += 1;
  }

  return { opened, insufficient, skipped };
};

/** Closes a leader trade and every follower copy of it. */
export const closeTraderTrade = async (tradeId: number, price?: number) => {
  const found = await pool.query(
    `SELECT * FROM copy_trader_trades WHERE id = $1 AND status = 'OPEN'`,
    [tradeId]
  );
  if (found.rows.length === 0) throw new CopyTradeError('Open leader trade not found.', 404);

  const trade = found.rows[0];
  const exitPrice = price ?? (await getMarketPrice(trade.pair));
  const pnlPct = ((exitPrice - Number(trade.entry_price)) / Number(trade.entry_price)) * 100;

  const positions = await pool.query(
    `SELECT * FROM copy_positions WHERE trader_trade_id = $1 AND status = 'OPEN'`,
    [tradeId]
  );

  let closed = 0;
  for (const position of positions.rows) {
    try {
      await closeCopyPosition(position, exitPrice);
      closed += 1;
    } catch (error) {
      console.error(`[copy] Failed closing position ${position.id}:`, (error as Error).message);
    }
  }

  await pool.query(
    `UPDATE copy_trader_trades
     SET status = 'CLOSED', exit_price = $1, pnl_pct = $2, closed_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [round(exitPrice), pnlPct.toFixed(4), tradeId]
  );

  return { closed, exitPrice, pnlPct };
};

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

/**
 * Leader list with statistics derived from their actual trade history.
 *
 * Every number here is computed from copy_trader_trades rather than stored on
 * the trader row, so a displayed win rate cannot drift from the trades that
 * produced it.
 */
export const listTraders = async () => {
  const result = await pool.query(`
    SELECT
      t.id, t.handle, t.display_name, t.avatar_url, t.bio, t.strategy,
      t.risk_score, t.verified, t.profit_share, t.max_followers, t.is_demo, t.status,
      COALESCE(s.total_trades, 0)      AS total_trades,
      COALESCE(s.wins, 0)              AS profitable_trades,
      COALESCE(s.win_rate, 0)          AS win_rate,
      COALESCE(s.roi_7d, 0)            AS roi_7d,
      COALESCE(s.roi_30d, 0)           AS roi_30d,
      COALESCE(f.followers, 0)         AS followers,
      COALESCE(f.aum, 0)               AS aum
    FROM copy_traders t
    LEFT JOIN (
      SELECT trader_id,
             COUNT(*) FILTER (WHERE status = 'CLOSED')                       AS total_trades,
             COUNT(*) FILTER (WHERE status = 'CLOSED' AND pnl_pct > 0)       AS wins,
             ROUND(
               (COUNT(*) FILTER (WHERE status = 'CLOSED' AND pnl_pct > 0)::numeric
                / NULLIF(COUNT(*) FILTER (WHERE status = 'CLOSED'), 0)) * 100, 1)
                                                                             AS win_rate,
             ROUND(COALESCE(SUM(pnl_pct * size_pct)
               FILTER (WHERE status = 'CLOSED' AND closed_at > NOW() - INTERVAL '7 days'), 0), 2)
                                                                             AS roi_7d,
             ROUND(COALESCE(SUM(pnl_pct * size_pct)
               FILTER (WHERE status = 'CLOSED' AND closed_at > NOW() - INTERVAL '30 days'), 0), 2)
                                                                             AS roi_30d
      FROM copy_trader_trades GROUP BY trader_id
    ) s ON s.trader_id = t.id
    LEFT JOIN (
      SELECT trader_id, COUNT(*)::int AS followers, SUM(allocated) AS aum
      FROM copy_subscriptions WHERE status = 'ACTIVE' GROUP BY trader_id
    ) f ON f.trader_id = t.id
    WHERE t.status = 'active'
    ORDER BY roi_30d DESC;
  `);

  return result.rows;
};

/** Daily cumulative return, for the sparkline on a leader card. */
export const traderPerformance = async (traderId: number, days = 30): Promise<number[]> => {
  const result = await pool.query(
    `
    SELECT DATE(closed_at) AS day, SUM(pnl_pct * size_pct) AS daily
    FROM copy_trader_trades
    WHERE trader_id = $1 AND status = 'CLOSED' AND closed_at > NOW() - ($2 || ' days')::interval
    GROUP BY DATE(closed_at) ORDER BY day ASC;
    `,
    [traderId, days]
  );

  let cumulative = 0;
  return result.rows.map((r) => {
    cumulative += Number(r.daily);
    return parseFloat(cumulative.toFixed(2));
  });
};

export const traderTrades = async (traderId: number, limit = 50) => {
  const result = await pool.query(
    `SELECT id, pair, side, size_pct::text, entry_price::text, exit_price::text,
            pnl_pct::text, status, opened_at, closed_at
     FROM copy_trader_trades WHERE trader_id = $1
     ORDER BY opened_at DESC LIMIT $2`,
    [traderId, limit]
  );
  return result.rows;
};

/** A follower's subscriptions, with live unrealised PnL on open copies. */
export const listSubscriptions = async (followerId: number) => {
  const subs = await pool.query(
    `SELECT s.*, t.handle, t.display_name, t.avatar_url, t.profit_share
     FROM copy_subscriptions s JOIN copy_traders t ON t.id = s.trader_id
     WHERE s.follower_id = $1
     ORDER BY s.started_at DESC`,
    [followerId]
  );

  const out = [];
  for (const sub of subs.rows) {
    const open = await pool.query(
      `SELECT * FROM copy_positions WHERE subscription_id = $1 AND status = 'OPEN'`,
      [sub.id]
    );

    let unrealised = 0;
    let deployed = 0;
    for (const p of open.rows) {
      deployed += Number(p.quote_spent);
      try {
        const price = await getMarketPrice(p.pair);
        unrealised += Number(p.quantity) * price - Number(p.quote_spent);
      } catch {
        // No price right now: report the position without a mark rather than
        // guessing a value for it.
      }
    }

    out.push({
      ...sub,
      open_positions: open.rows.length,
      deployed: deployed.toFixed(2),
      unrealised_pnl: unrealised.toFixed(2),
    });
  }

  return out;
};

export const listPositions = async (followerId: number, limit = 100) => {
  const result = await pool.query(
    `SELECT p.*, t.display_name, t.handle
     FROM copy_positions p
     JOIN copy_subscriptions s ON s.id = p.subscription_id
     JOIN copy_traders t ON t.id = s.trader_id
     WHERE p.follower_id = $1
     ORDER BY p.opened_at DESC LIMIT $2`,
    [followerId, limit]
  );
  return result.rows;
};
