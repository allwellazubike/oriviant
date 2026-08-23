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

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Accept: 'application/json',
};

const CACHE_TTL_MS = 15_000;
const STALE_GRACE_MS = 10 * 60 * 1000;
const MAX_SYMBOLS_PER_REQUEST = 20;

interface CacheEntry {
  quotes: Record<string, Quote>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<Record<string, Quote>> | null = null;

// ---> NEW: Real-Time Server Telemetry Tracker <---
export const feedTelemetry = {
  isOnline: false,
  latencyMs: 0,
  totalTicksReceived: 0,
  lastUpdated: 0,
  provider: 'Yahoo Finance (REST)'
};

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
  const startTime = Date.now(); // Start latency timer

  const batches: string[][] = [];
  for (let i = 0; i < ALL_YAHOO_SYMBOLS.length; i += MAX_SYMBOLS_PER_REQUEST) {
    batches.push(ALL_YAHOO_SYMBOLS.slice(i, i + MAX_SYMBOLS_PER_REQUEST));
  }

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

    const closes: number[] = (result?.response?.[0]?.indicators?.quote?.[0]?.close ?? [])
      .map(num)
      .filter((c: number | null): c is number => c !== null && c > 0);

    const high = closes.length ? Math.max(...closes, price) : price;
    const low = closes.length ? Math.min(...closes, price) : price;

    const change24h =
      previousClose > 0
        ? parseFloat((((price - previousClose) / previousClose) * 100).toFixed(2))
        : 0;

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

  // ---> UPDATE TELEMETRY ON SUCCESS <---
  feedTelemetry.isOnline = true;
  feedTelemetry.latencyMs = Date.now() - startTime;
  feedTelemetry.lastUpdated = Date.now();
  feedTelemetry.totalTicksReceived += Object.keys(quotes).length;

  return quotes;
};

export interface QuotesResult {
  quotes: Record<string, Quote>;
  fetchedAt: number;
  stale: boolean;
}

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
    
    // ---> UPDATE TELEMETRY ON FAILURE <---
    feedTelemetry.isOnline = false;

    if (cache && now - cache.fetchedAt < STALE_GRACE_MS) {
      return { quotes: cache.quotes, fetchedAt: cache.fetchedAt, stale: true };
    }
    throw error;
  }
};

export const marketDataService = {
  fetchLivePrice: async (pair: string): Promise<Quote> => {
    const { quotes } = await getQuotes();
    const quote = quotes[pair];
    
    if (!quote) {
      throw new Error(`Live price not available for ${pair}`);
    }
    
    return quote;
  },

  getAllPrices: async (pairs?: string[]): Promise<Quote[]> => {
    const { quotes } = await getQuotes();
    
    if (!pairs || pairs.length === 0) {
      return Object.values(quotes);
    }
    
    return pairs.map((p) => quotes[p]).filter(Boolean);
  },

  // ---> NEW: Export telemetry for the Admin Controller <---
  getTelemetry: () => feedTelemetry
};