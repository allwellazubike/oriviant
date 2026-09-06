import {
  ALL_YAHOO_SYMBOLS,
  ORIVIANT_SYMBOL_BY_YAHOO,
  CRYPTO_SYMBOL_MAP,
  ALL_CRYPTO_SYMBOLS,
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
  /** Only populated for crypto quotes — Yahoo's spark endpoint doesn't carry volume. */
  volume24h?: number;
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

/*
 * Crypto quotes come from Binance's 24hr ticker, not Yahoo — same reasoning
 * as the frontend's live coin ticker (see marketSymbols.ts): it's the venue
 * these pairs actually trade on, and it returns price + 24h change + 24h
 * volume in a single call, which is exactly the three columns the Markets
 * table needs. Cached separately from Yahoo (much shorter TTL, and one
 * outage must not take down the other) and merged into getQuotes() below.
 */
// data-api.binance.vision is Binance's public, read-only market-data mirror.
// It carries the same REST shape as api.binance.com but isn't subject to the
// same regional/IP blocking that made the main trading API unreachable from
// this app's hosting environment.
const BINANCE_24HR_URL = 'https://data-api.binance.vision/api/v3/ticker/24hr';
const BINANCE_KLINES_URL = 'https://data-api.binance.vision/api/v3/klines';

const CRYPTO_CACHE_TTL_MS = 4_000;
const SPARKLINE_CACHE_TTL_MS = 5 * 60 * 1000; // 7D shape barely changes minute to minute

let cryptoCache: CacheEntry | null = null;
let cryptoInFlight: Promise<Record<string, Quote>> | null = null;

let sparklineCache: { data: Record<string, number[]>; fetchedAt: number } | null = null;
let sparklineInFlight: Promise<Record<string, number[]>> | null = null;

const fetchCryptoSparklines = async (): Promise<Record<string, number[]>> => {
  // Binance has no multi-symbol klines endpoint, so this is one request per
  // pair — acceptable because it only runs once every five minutes.
  const entries = await Promise.allSettled(
    ALL_CRYPTO_SYMBOLS.map(async (oriviantSymbol) => {
      const binanceSymbol = CRYPTO_SYMBOL_MAP[oriviantSymbol];
      const url = `${BINANCE_KLINES_URL}?symbol=${binanceSymbol}&interval=6h&limit=28`; // ~7 days
      const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (!res.ok) throw new Error(`Binance klines responded ${res.status} for ${binanceSymbol}`);
      const rows = (await res.json()) as any[];
      // Kline row shape: [openTime, open, high, low, close, volume, ...]
      const closes = rows.map((r) => parseFloat(r[4])).filter((c) => Number.isFinite(c) && c > 0);
      return { oriviantSymbol, closes };
    })
  );

  const result: Record<string, number[]> = {};
  for (const entry of entries) {
    if (entry.status === 'fulfilled' && entry.value.closes.length > 0) {
      result[entry.value.oriviantSymbol] = entry.value.closes;
    }
  }
  return result;
};

const getSparklines = async (): Promise<Record<string, number[]>> => {
  const now = Date.now();
  if (sparklineCache && now - sparklineCache.fetchedAt < SPARKLINE_CACHE_TTL_MS) {
    return sparklineCache.data;
  }
  if (!sparklineInFlight) {
    sparklineInFlight = fetchCryptoSparklines().finally(() => {
      sparklineInFlight = null;
    });
  }
  try {
    const data = await sparklineInFlight;
    sparklineCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return sparklineCache?.data ?? {};
  }
};

const fetchCryptoQuotes = async (): Promise<Record<string, Quote>> => {
  const binanceSymbols = Object.values(CRYPTO_SYMBOL_MAP);
  const url = `${BINANCE_24HR_URL}?symbols=${encodeURIComponent(JSON.stringify(binanceSymbols))}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`Binance 24hr ticker responded ${res.status}`);
  const rows = (await res.json()) as any[];
  if (!Array.isArray(rows)) throw new Error('Unexpected Binance 24hr payload shape');

  const symbolByBinance: Record<string, string> = {};
  for (const [oriviantSymbol, binanceSymbol] of Object.entries(CRYPTO_SYMBOL_MAP)) {
    symbolByBinance[binanceSymbol] = oriviantSymbol;
  }

  const sparklines = await getSparklines();

  const quotes: Record<string, Quote> = {};
  for (const row of rows) {
    const oriviantSymbol = symbolByBinance[row.symbol];
    if (!oriviantSymbol) continue;

    const price = num(row.lastPrice);
    if (price === null || price <= 0) continue;

    quotes[oriviantSymbol] = {
      symbol: oriviantSymbol,
      price,
      previousClose: num(row.prevClosePrice) ?? price,
      change24h: num(row.priceChangePercent) ?? 0,
      high24h: num(row.highPrice) ?? price,
      low24h: num(row.lowPrice) ?? price,
      currency: 'USD',
      sparkline: sparklines[oriviantSymbol]?.length ? sparklines[oriviantSymbol] : [price],
      volume24h: num(row.quoteVolume) ?? 0
    };
  }

  if (Object.keys(quotes).length === 0) {
    throw new Error('Binance returned no usable crypto quotes');
  }

  return quotes;
};

const getCryptoQuotes = async (): Promise<Record<string, Quote>> => {
  const now = Date.now();
  if (cryptoCache && now - cryptoCache.fetchedAt < CRYPTO_CACHE_TTL_MS) {
    return cryptoCache.quotes;
  }
  if (!cryptoInFlight) {
    cryptoInFlight = fetchCryptoQuotes().finally(() => {
      cryptoInFlight = null;
    });
  }
  try {
    const quotes = await cryptoInFlight;
    cryptoCache = { quotes, fetchedAt: Date.now() };
    return quotes;
  } catch (error) {
    console.error('Crypto market data fetch failed:', (error as Error).message);
    return cryptoCache?.quotes ?? {};
  }
};

export interface QuotesResult {
  quotes: Record<string, Quote>;
  fetchedAt: number;
  stale: boolean;
}

export const getQuotes = async (): Promise<QuotesResult> => {
  const now = Date.now();

  let yahooQuotes: Record<string, Quote>;
  let stale = false;

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    yahooQuotes = cache.quotes;
  } else {
    if (!inFlight) {
      inFlight = fetchFromYahoo().finally(() => {
        inFlight = null;
      });
    }

    try {
      yahooQuotes = await inFlight;
      cache = { quotes: yahooQuotes, fetchedAt: Date.now() };
    } catch (error) {
      console.error('Market data fetch failed:', (error as Error).message);
      feedTelemetry.isOnline = false;

      if (cache && now - cache.fetchedAt < STALE_GRACE_MS) {
        yahooQuotes = cache.quotes;
        stale = true;
      } else {
        yahooQuotes = {};
      }
    }
  }

  // A Yahoo outage must not take crypto down with it, and vice versa.
  const cryptoQuotes = await getCryptoQuotes();
  const quotes = { ...yahooQuotes, ...cryptoQuotes };

  if (Object.keys(quotes).length === 0) {
    throw new Error('No market data available from any provider');
  }

  return { quotes, fetchedAt: cache?.fetchedAt ?? Date.now(), stale };
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