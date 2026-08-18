import {
  ALL_YAHOO_SYMBOLS,
  ORIVIANT_SYMBOL_BY_YAHOO,
} from '../config/marketSymbols.js';

export interface Quote {
  symbol: string;
  price: number;
  previousClose: number;
  change24h: number;
  high24h: number;
  low24h: number;
  currency: string;
  sparkline: number[];
}

const SPARK_URL = 'https://query1.finance.yahoo.com/v7/finance/spark';

/**
 * Yahoo rejects requests without a browser-ish UA.
 */
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Accept: 'application/json',
};

/**
 * Cache TTL. Traditional markets do not tick meaningfully faster than this, and
 * it keeps us to ~4 upstream calls a minute no matter how many users are online.
 */
const CACHE_TTL_MS = 15_000;

/** How long we keep serving stale data when upstream is failing. */
const STALE_GRACE_MS = 10 * 60 * 1000;

/**
 * Yahoo rejects the spark endpoint above ~20 symbols per request (verified:
 * 20 succeeds, 25 returns 400), so requests are chunked.
 */
const MAX_SYMBOLS_PER_REQUEST = 20;

interface CacheEntry {
  quotes: Record<string, Quote>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
// Collapses concurrent requests onto a single upstream fetch.
let inFlight: Promise<Record<string, Quote>> | null = null;

const num = (value: unknown): number | null => {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

const fetchBatch = async (symbols: string[]): Promise<any[]> => {
  const url = `${SPARK_URL}?symbols=${symbols
    .map(encodeURIComponent)
    .join(',')}&range=1d&interval=5m`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      headers: REQUEST_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Yahoo responded ${res.status}`);
    const payload: any = await res.json();

    const results = payload?.spark?.result;
    if (!Array.isArray(results)) throw new Error('Unexpected Yahoo payload shape');
    return results;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchFromYahoo = async (): Promise<Record<string, Quote>> => {
  const batches: string[][] = [];
  for (let i = 0; i < ALL_YAHOO_SYMBOLS.length; i += MAX_SYMBOLS_PER_REQUEST) {
    batches.push(ALL_YAHOO_SYMBOLS.slice(i, i + MAX_SYMBOLS_PER_REQUEST));
  }

  // allSettled: one failing batch should cost us that batch's symbols, not
  // every price on the platform.
  const settled = await Promise.allSettled(batches.map(fetchBatch));

  const results: any[] = [];
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      results.push(...outcome.value);
    } else {
      console.error('Market data batch failed:', outcome.reason?.message);
    }
  }

  const quotes: Record<string, Quote> = {};

  for (const result of results) {
    const meta = result?.response?.[0]?.meta;
    if (!meta) continue;

    const price = num(meta.regularMarketPrice);
    if (price === null || price <= 0) continue;

    const previousClose = num(meta.chartPreviousClose) ?? price;

    // Intraday closes, used to drive the sparkline and the day's range.
    const closes: number[] = (result?.response?.[0]?.indicators?.quote?.[0]?.close ?? [])
      .map(num)
      .filter((c: number | null): c is number => c !== null && c > 0);

    // Yahoo's meta high/low are unreliable on the spark endpoint, so derive them.
    const high = closes.length ? Math.max(...closes, price) : price;
    const low = closes.length ? Math.min(...closes, price) : price;

    const change24h =
      previousClose > 0
        ? parseFloat((((price - previousClose) / previousClose) * 100).toFixed(2))
        : 0;

    // Downsample to at most 32 points — enough for a sparkline, cheap to ship.
    const step = Math.max(1, Math.ceil(closes.length / 32));
    const sparkline = closes.filter((_, i) => i % step === 0).slice(-32);

    for (const oriviantSymbol of ORIVIANT_SYMBOL_BY_YAHOO[meta.symbol] ?? []) {
      quotes[oriviantSymbol] = {
        symbol: oriviantSymbol,
        price,
        previousClose,
        change24h,
        high24h: high,
        low24h: low,
        currency: meta.currency ?? 'USD',
        sparkline: sparkline.length ? sparkline : [price],
      };
    }
  }

  if (Object.keys(quotes).length === 0) {
    throw new Error('Yahoo returned no usable quotes');
  }

  return quotes;
};

export interface QuotesResult {
  quotes: Record<string, Quote>;
  fetchedAt: number;
  stale: boolean;
}

/**
 * Returns cached quotes, refreshing from upstream when the cache expires.
 *
 * If upstream fails we keep serving the last good snapshot (flagged stale)
 * rather than blanking every price on the platform over one bad request.
 */
export const getQuotes = async (): Promise<QuotesResult> => {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { quotes: cache.quotes, fetchedAt: cache.fetchedAt, stale: false };
  }

  if (!inFlight) {
    inFlight = fetchFromYahoo().finally(() => {
      inFlight = null;
    });
  }

  try {
    const quotes = await inFlight;
    cache = { quotes, fetchedAt: Date.now() };
    return { quotes, fetchedAt: cache.fetchedAt, stale: false };
  } catch (error) {
    console.error('Market data fetch failed:', (error as Error).message);

    if (cache && now - cache.fetchedAt < STALE_GRACE_MS) {
      return { quotes: cache.quotes, fetchedAt: cache.fetchedAt, stale: true };
    }
    throw error;
  }
};
