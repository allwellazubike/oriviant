import pool from '../config/db.js';
import { getMarketPrice } from './priceOracle.js';
import { publishTraderTrade, closeTraderTrade } from './copyTradingService.js';

/**
 * Seeded showcase traders for the pre-launch demo.
 *
 * Their track records are generated, not earned. That is the whole point — the
 * platform has no real leaders yet, and an empty copy-trading page cannot be
 * evaluated. Two rules make this defensible rather than deceptive:
 *
 *   1. Every profile is flagged is_demo, so they can be listed and purged as a
 *      set (`npm run demo-traders -- clear`). Real leaders will never carry it.
 *   2. Their history is built from REAL historical Binance candles. A trade
 *      opened at 14:00 on the 3rd exits at the price the market actually
 *      printed later that day. The equity curves therefore correspond to moves
 *      that genuinely happened, which is what stops generated data looking
 *      generated: the drawdowns land where the market actually fell.
 *
 * These profiles must be removed before real customers can allocate money to
 * them. Copying a fabricated track record with real funds is the line between
 * a demo and a misrepresentation.
 */

interface DemoProfile {
  handle: string;
  display_name: string;
  bio: string;
  strategy: string;
  risk_score: number;
  verified: boolean;
  profit_share: number;
  /** Fraction of equity per position — defines how aggressive they look. */
  size_pct: number;
  /** Roughly how many trades they take per week. */
  trades_per_week: number;
  /** Typical holding period in hours. */
  hold_hours: number;
  /**
   * Share of trades that are winners, 0-1.
   *
   * Applied by *selecting* real historical windows that went the right way,
   * not by inventing prices. A 0.62 trader still shows real losses — they are
   * simply outnumbered, exactly as a genuinely good trader's record looks.
   */
  skill: number;
  pairs: string[];
}

const PROFILES: DemoProfile[] = [
  {
    handle: 'apex_quant', display_name: 'Apex Quant', strategy: 'Momentum',
    bio: 'Systematic momentum on majors. Positions sized to volatility, no overnight leverage.',
    risk_score: 4, verified: true, profit_share: 0.12, size_pct: 0.08,
    trades_per_week: 9, hold_hours: 14, skill: 0.63, pairs: ['BTC/USDT', 'ETH/USDT'],
  },
  {
    handle: 'nadia_swing', display_name: 'Nadia Rahman', strategy: 'Swing',
    bio: 'Multi-day swings around structure. Fewer trades, wider stops, patient entries.',
    risk_score: 5, verified: true, profit_share: 0.15, size_pct: 0.12,
    trades_per_week: 4, hold_hours: 52, skill: 0.60, pairs: ['BTC/USDT', 'SOL/USDT'],
  },
  {
    handle: 'kwame_scalps', display_name: 'Kwame Osei', strategy: 'Scalping',
    bio: 'High-frequency intraday scalps. Small edges, tight risk, heavy volume.',
    risk_score: 7, verified: true, profit_share: 0.10, size_pct: 0.05,
    trades_per_week: 26, hold_hours: 3, skill: 0.57, pairs: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'],
  },
  {
    handle: 'steady_yield', display_name: 'Meridian Capital', strategy: 'Conservative',
    bio: 'Capital preservation first. Low allocation per idea, majors only.',
    risk_score: 2, verified: true, profit_share: 0.10, size_pct: 0.04,
    trades_per_week: 3, hold_hours: 96, skill: 0.66, pairs: ['BTC/USDT'],
  },
  {
    handle: 'lin_breakout', display_name: 'Lin Wei', strategy: 'Breakout',
    bio: 'Trades range expansion. Accepts frequent small losses for outsized winners.',
    risk_score: 8, verified: false, profit_share: 0.15, size_pct: 0.15,
    trades_per_week: 7, hold_hours: 20, skill: 0.48, pairs: ['SOL/USDT', 'ETH/USDT'],
  },
  {
    handle: 'tobi_trend', display_name: 'Tobi Adeyemi', strategy: 'Trend Following',
    bio: 'Rides established trends on the 4H. Exits on structure breaks, never on hope.',
    risk_score: 5, verified: true, profit_share: 0.12, size_pct: 0.10,
    trades_per_week: 5, hold_hours: 40, skill: 0.61, pairs: ['BTC/USDT', 'ETH/USDT'],
  },
  {
    handle: 'ines_meanrev', display_name: 'Inés Duarte', strategy: 'Mean Reversion',
    bio: 'Fades stretched moves back to the mean. High win rate, occasional deep drawdown.',
    risk_score: 6, verified: true, profit_share: 0.12, size_pct: 0.09,
    trades_per_week: 11, hold_hours: 8, skill: 0.71, pairs: ['BTC/USDT', 'XRP/USDT'],
  },
  {
    handle: 'volt_systems', display_name: 'Volt Systems', strategy: 'Algorithmic',
    bio: 'Fully automated execution. No discretionary overrides, no exceptions.',
    risk_score: 6, verified: true, profit_share: 0.15, size_pct: 0.07,
    trades_per_week: 15, hold_hours: 6, skill: 0.59, pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  },
];

interface Candle { openTime: number; open: number; high: number; low: number; close: number }

/** Real hourly candles from Binance. No key required. */
const fetchCandles = async (pair: string, hours: number): Promise<Candle[]> => {
  const symbol = pair.replace('/', '').toUpperCase();
  const limit = Math.min(1000, hours);
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=${limit}`,
    { signal: AbortSignal.timeout(20000) }
  );
  if (!res.ok) throw new Error(`Binance klines ${res.status} for ${symbol}`);

  const rows = (await res.json()) as any[];
  return rows.map((r) => ({
    openTime: r[0],
    open: parseFloat(r[1]),
    high: parseFloat(r[2]),
    low: parseFloat(r[3]),
    close: parseFloat(r[4]),
  }));
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Builds a leader's past trades from real candles.
 *
 * For each trade we choose a real entry hour and a real exit hour a holding
 * period later, and use the actual prices from those candles. Whether the
 * result is a win is therefore decided by the market, not by us. `skill` only
 * controls how many candidate windows we look at before accepting one — a
 * strong trader is modelled as someone who picks their moments well, which
 * still leaves them holding genuine losers.
 */
const backfillTrader = async (traderId: number, profile: DemoProfile, days: number) => {
  const totalHours = days * 24;
  const candlesByPair = new Map<string, Candle[]>();

  for (const pair of profile.pairs) {
    try {
      candlesByPair.set(pair, await fetchCandles(pair, totalHours));
    } catch (error) {
      console.warn(`[demo] No candles for ${pair}: ${(error as Error).message}`);
    }
  }

  const usable = profile.pairs.filter((p) => (candlesByPair.get(p)?.length ?? 0) > 48);
  if (usable.length === 0) throw new Error('No usable candle history for any pair.');

  const tradeCount = Math.round((profile.trades_per_week * days) / 7);
  const rows: any[][] = [];

  for (let i = 0; i < tradeCount; i++) {
    const pair = pick(usable);
    const candles = candlesByPair.get(pair)!;
    const hold = Math.max(1, Math.round(profile.hold_hours * (0.6 + Math.random() * 0.8)));

    // Try a few real windows; accept one whose direction matches the profile's
    // hit rate. Both outcomes come from real prices either way.
    const wantWinner = Math.random() < profile.skill;
    let chosen: { entry: Candle; exit: Candle } | null = null;

    for (let attempt = 0; attempt < 12; attempt++) {
      const start = Math.floor(Math.random() * (candles.length - hold - 1));
      const entry = candles[start];
      const exit = candles[start + hold];
      if (!entry || !exit) continue;
      const isWinner = exit.close > entry.close;
      if (isWinner === wantWinner) { chosen = { entry, exit }; break; }
      if (attempt === 11) chosen = { entry, exit }; // take what the market gave
    }
    if (!chosen) continue;

    const entryPrice = chosen.entry.close;
    const exitPrice = chosen.exit.close;
    const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
    const [base, quote] = pair.split('/');

    rows.push([
      traderId, pair, base, quote, 'buy',
      profile.size_pct.toFixed(4), entryPrice.toFixed(8), exitPrice.toFixed(8),
      pnlPct.toFixed(4), 'CLOSED',
      new Date(chosen.entry.openTime).toISOString(),
      new Date(chosen.exit.openTime).toISOString(),
    ]);
  }

  // One multi-row INSERT rather than a query per trade: a leader can have
  // hundreds of trades, and each round trip to Neon costs far more than the
  // insert itself. Chunked to stay well under Postgres' parameter limit.
  const COLUMNS = 12;
  const CHUNK = 500;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const placeholders = chunk
      .map((_, r) => `(${Array.from({ length: COLUMNS }, (_, c) => `$${r * COLUMNS + c + 1}`).join(',')})`)
      .join(',');

    await pool.query(
      `INSERT INTO copy_trader_trades
         (trader_id, pair, base_asset, quote_asset, side, size_pct, entry_price,
          exit_price, pnl_pct, status, opened_at, closed_at)
       VALUES ${placeholders}`,
      chunk.flat()
    );
  }

  return rows.length;
};

/** Creates (or refreshes) the demo leaders and their history. */
export const seedDemoTraders = async (days = 90) => {
  const summary: Array<{ handle: string; trades: number }> = [];

  for (const profile of PROFILES) {
    const existing = await pool.query('SELECT id FROM copy_traders WHERE handle = $1', [profile.handle]);

    let traderId: number;
    if (existing.rows.length > 0) {
      traderId = existing.rows[0].id;
      await pool.query('DELETE FROM copy_trader_trades WHERE trader_id = $1', [traderId]);
    } else {
      const created = await pool.query(
        `INSERT INTO copy_traders
           (handle, display_name, avatar_url, bio, strategy, risk_score, verified,
            profit_share, base_equity, is_demo, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,'active') RETURNING id`,
        [
          profile.handle, profile.display_name,
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.display_name)}`,
          profile.bio, profile.strategy, profile.risk_score, profile.verified,
          profile.profit_share, 100000,
        ]
      );
      traderId = created.rows[0].id;
    }

    try {
      const n = await backfillTrader(traderId, profile, days);
      summary.push({ handle: profile.handle, trades: n });
    } catch (error) {
      console.error(`[demo] ${profile.handle}: ${(error as Error).message}`);
      summary.push({ handle: profile.handle, trades: 0 });
    }
  }

  return summary;
};

export const clearDemoTraders = async () => {
  const r = await pool.query('DELETE FROM copy_traders WHERE is_demo = true');
  return r.rowCount ?? 0;
};

/**
 * One tick of live activity.
 *
 * Called on an interval by the server. Each leader independently decides
 * whether to close something it is holding or open something new, at a rate
 * derived from its own trades-per-week. Because the decision is per-leader and
 * probabilistic, the feed never falls into a visible pattern — which was the
 * thing to avoid over a two-month test.
 */
export const tickDemoTraders = async (intervalMs: number) => {
  const traders = await pool.query(
    `SELECT id, handle FROM copy_traders WHERE is_demo = true AND status = 'active'`
  );
  if (traders.rows.length === 0) return { opened: 0, closed: 0 };

  let opened = 0;
  let closed = 0;

  for (const trader of traders.rows) {
    const profile = PROFILES.find((p) => p.handle === trader.handle);
    if (!profile) continue;

    // Close anything held longer than its intended horizon.
    const open = await pool.query(
      `SELECT id, opened_at, pair FROM copy_trader_trades
       WHERE trader_id = $1 AND status = 'OPEN'`,
      [trader.id]
    );

    for (const t of open.rows) {
      const heldHours = (Date.now() - new Date(t.opened_at).getTime()) / 3_600_000;
      if (heldHours >= profile.hold_hours * (0.5 + Math.random())) {
        try {
          await closeTraderTrade(t.id);
          closed += 1;
        } catch (error) {
          console.error(`[demo] close failed for ${trader.handle}:`, (error as Error).message);
        }
      }
    }

    // Open a new one at this leader's own rate.
    const perMs = profile.trades_per_week / (7 * 24 * 60 * 60 * 1000);
    if (Math.random() < perMs * intervalMs && open.rows.length < 3) {
      const pair = pick(profile.pairs);
      try {
        await getMarketPrice(pair); // skip quietly if this pair has no price
        await publishTraderTrade({ traderId: trader.id, pair, sizePct: profile.size_pct });
        opened += 1;
      } catch (error) {
        console.error(`[demo] open failed for ${trader.handle}:`, (error as Error).message);
      }
    }
  }

  return { opened, closed };
};
