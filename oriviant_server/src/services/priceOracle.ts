/**
 * Authoritative price source for trade execution.
 *
 * Trades are ALWAYS priced from here, never from a price supplied by the
 * client. A client-supplied price is a client-supplied balance: anyone could
 * post "buy 1 BTC at $1" and mint themselves money.
 */

const BINANCE_TICKER_URL = 'https://api.binance.com/api/v3/ticker/price';

/**
 * Short TTL: this drives real executions, so a stale quote means filling at a
 * price the market has already left.
 */
const CACHE_TTL_MS = 5_000;

/** Refuse to trade on a quote older than this, even if refresh is failing. */
const MAX_ACCEPTABLE_AGE_MS = 60_000;

interface PriceCache {
  prices: Map<string, number>;
  fetchedAt: number;
}

let cache: PriceCache | null = null;
let inFlight: Promise<PriceCache> | null = null;

const fetchBinancePrices = async (): Promise<PriceCache> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(BINANCE_TICKER_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Binance responded ${res.status}`);

    const rows = (await res.json()) as Array<{ symbol: string; price: string }>;
    if (!Array.isArray(rows)) throw new Error('Unexpected Binance payload');

    const prices = new Map<string, number>();
    for (const row of rows) {
      const value = parseFloat(row.price);
      if (Number.isFinite(value) && value > 0) prices.set(row.symbol, value);
    }

    if (prices.size === 0) throw new Error('Binance returned no usable prices');
    return { prices, fetchedAt: Date.now() };
  } finally {
    clearTimeout(timeout);
  }
};

const getCache = async (): Promise<PriceCache> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache;

  if (!inFlight) {
    inFlight = fetchBinancePrices().finally(() => {
      inFlight = null;
    });
  }

  try {
    cache = await inFlight;
    return cache;
  } catch (error) {
    // Serve a slightly stale quote rather than halting trading on one blip,
    // but only inside the age ceiling checked by the caller below.
    if (cache) return cache;
    throw error;
  }
};

export class PriceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PriceUnavailableError';
  }
}

/**
 * Current market price for a pair such as "BTC/USDT".
 * Throws rather than guessing — a trade with no trustworthy price must not run.
 */
export const getMarketPrice = async (pair: string): Promise<number> => {
  const snapshot = await getCache();

  const age = Date.now() - snapshot.fetchedAt;
  if (age > MAX_ACCEPTABLE_AGE_MS) {
    throw new PriceUnavailableError(
      'Market price feed is stale. Trading is paused until it recovers.'
    );
  }

  const binanceSymbol = pair.replace('/', '').toUpperCase();
  const price = snapshot.prices.get(binanceSymbol);

  if (price === undefined) {
    throw new PriceUnavailableError(`No market price available for ${pair}.`);
  }

  return price;
};

/** Pairs we will accept orders for — exactly what Binance quotes. */
export const isTradablePair = async (pair: string): Promise<boolean> => {
  try {
    await getMarketPrice(pair);
    return true;
  } catch {
    return false;
  }
};
