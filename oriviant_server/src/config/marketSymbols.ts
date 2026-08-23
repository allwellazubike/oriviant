/**
 * Maps Oriviant's display symbols to Yahoo Finance ticker symbols.
 *
 * Crypto is deliberately absent — the frontend streams those straight from the
 * Binance websocket, which is faster and free. This map only covers the asset
 * classes that need a server-side proxy (browsers cannot call Yahoo directly
 * because it sends no CORS headers).
 *
 * Yahoo suffix conventions:
 *   =X  foreign exchange pair      =F  futures contract      ^   index
 */
export const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // Forex — majors
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'USDJPY=X',
  'USD/CHF': 'USDCHF=X',
  'AUD/USD': 'AUDUSD=X',
  'NZD/USD': 'NZDUSD=X',
  'USD/CAD': 'USDCAD=X',
  // Forex — crosses (these were never mapped in the old client-side feed)
  'EUR/GBP': 'EURGBP=X',
  'EUR/JPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X',
  'AUD/JPY': 'AUDJPY=X',

  // Stocks — ticker is identical on Yahoo
  AAPL: 'AAPL',
  MSFT: 'MSFT',
  NVDA: 'NVDA',
  AMZN: 'AMZN',
  GOOGL: 'GOOGL',
  META: 'META',
  TSLA: 'TSLA',
  NFLX: 'NFLX',
  AMD: 'AMD',
  INTC: 'INTC',
  ORCL: 'ORCL',
  CRM: 'CRM',
  V: 'V',
  MA: 'MA',
  JPM: 'JPM',
  GS: 'GS',
  JNJ: 'JNJ',
  KO: 'KO',
  MCD: 'MCD',
  WMT: 'WMT',
  DIS: 'DIS',

  // ETFs
  SPY: 'SPY',
  QQQ: 'QQQ',
  VTI: 'VTI',
  VOO: 'VOO',
  IWM: 'IWM',
  DIA: 'DIA',
  ARKK: 'ARKK',
  XLF: 'XLF',
  XLE: 'XLE',
  XLK: 'XLK',

  // Indices
  US500: '^GSPC',
  NAS100: '^NDX',
  US30: '^DJI',
  UK100: '^FTSE',
  GER40: '^GDAXI',
  FRA40: '^FCHI',
  JP225: '^N225',
  HK50: '^HSI',

  // Metals — spot proxied by the front-month future
  'XAU/USD': 'GC=F',
  'XAG/USD': 'SI=F',
  COPPER: 'HG=F',
  'XPT/USD': 'PL=F',
  'XPD/USD': 'PA=F',

  // Energy
  WTI: 'CL=F',
  BRENT: 'BZ=F',
  NATGAS: 'NG=F',
  HOIL: 'HO=F',
  GASOLINE: 'RB=F',

  // Agricultural commodities
  CORN: 'ZC=F',
  WHEAT: 'ZW=F',
  SOYBEAN: 'ZS=F',
  COFFEE: 'KC=F',

  // Bonds — quoted as yields, not prices
  US10Y: '^TNX',
  US30Y: '^TYX',
  BUND: '^TNX',
};

/** Reverse lookup, so a Yahoo response row can be matched back to our symbol. */
export const ORIVIANT_SYMBOL_BY_YAHOO: Record<string, string[]> = Object.entries(
  YAHOO_SYMBOL_MAP
).reduce<Record<string, string[]>>((acc, [oriviant, yahoo]) => {
  // BUND and US10Y share a Yahoo ticker, so one Yahoo symbol can map to many.
  (acc[yahoo] ||= []).push(oriviant);
  return acc;
}, {});

export const ALL_YAHOO_SYMBOLS = Object.keys(ORIVIANT_SYMBOL_BY_YAHOO);
