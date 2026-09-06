import pool from '../config/db.js';

/**
 * Repopulates the admin-managed multi-asset market directory.
 *
 * `market_assets` only ever held 3 crypto rows after an earlier cleanup, but
 * the platform is marketed (and priced elsewhere in mockData.ts) as a
 * multi-asset exchange — crypto, forex, stocks, ETFs, indices, metals,
 * energy and agricultural commodities. This restores that breadth.
 *
 * ON CONFLICT (symbol) DO NOTHING makes reruns safe: existing rows (and any
 * admin edits made to them since) are left untouched.
 *
 *   npm run seed-markets
 */
interface SeedAsset {
  name: string;
  symbol: string;
  category: 'Crypto' | 'Forex' | 'Stocks' | 'ETFs' | 'Indices' | 'Metals' | 'Energy' | 'Commodities';
  description: string;
  spotAvailable: boolean;
  futuresAvailable: boolean;
  copyTradingAvailable: boolean;
  demoAvailable: boolean;
  minOrder: number;
  maxOrder: number;
  tradingFee: string;
  leverageLimits: string;
  pricePrecision: number;
  qtyPrecision: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewListing?: boolean;
}

const crypto = (
  name: string,
  symbol: string,
  leverage: string,
  pricePrecision = 2,
  extra: Partial<SeedAsset> = {}
): SeedAsset => ({
  name,
  symbol,
  category: 'Crypto',
  description: `${name} perpetual and spot trading against USDT.`,
  spotAvailable: true,
  futuresAvailable: true,
  copyTradingAvailable: true,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 1_000_000,
  tradingFee: '0.02%',
  leverageLimits: leverage,
  pricePrecision,
  qtyPrecision: 4,
  ...extra
});

const forex = (name: string, symbol: string, pricePrecision = 4): SeedAsset => ({
  name,
  symbol,
  category: 'Forex',
  description: `${name} major currency pair.`,
  spotAvailable: true,
  futuresAvailable: true,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 500_000,
  tradingFee: '0.01%',
  leverageLimits: '500x',
  pricePrecision,
  qtyPrecision: 2
});

const stock = (name: string, symbol: string, extra: Partial<SeedAsset> = {}): SeedAsset => ({
  name,
  symbol,
  category: 'Stocks',
  description: `${name} equity, tokenized for 24/5 trading.`,
  spotAvailable: true,
  futuresAvailable: false,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 250_000,
  tradingFee: '0.05%',
  leverageLimits: '5x',
  pricePrecision: 2,
  qtyPrecision: 4,
  ...extra
});

const etf = (name: string, symbol: string): SeedAsset => ({
  name,
  symbol,
  category: 'ETFs',
  description: `${name} exchange-traded fund.`,
  spotAvailable: true,
  futuresAvailable: false,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 250_000,
  tradingFee: '0.05%',
  leverageLimits: '5x',
  pricePrecision: 2,
  qtyPrecision: 4
});

const index = (name: string, symbol: string): SeedAsset => ({
  name,
  symbol,
  category: 'Indices',
  description: `${name} cash index CFD.`,
  spotAvailable: false,
  futuresAvailable: true,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 500_000,
  tradingFee: '0.03%',
  leverageLimits: '100x',
  pricePrecision: 2,
  qtyPrecision: 2
});

const metal = (name: string, symbol: string, extra: Partial<SeedAsset> = {}): SeedAsset => ({
  name,
  symbol,
  category: 'Metals',
  description: `${name} spot price.`,
  spotAvailable: true,
  futuresAvailable: true,
  copyTradingAvailable: true,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 500_000,
  tradingFee: '0.02%',
  leverageLimits: '100x',
  pricePrecision: 2,
  qtyPrecision: 2,
  ...extra
});

const energy = (name: string, symbol: string): SeedAsset => ({
  name,
  symbol,
  category: 'Energy',
  description: `${name} futures contract.`,
  spotAvailable: false,
  futuresAvailable: true,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 500_000,
  tradingFee: '0.03%',
  leverageLimits: '50x',
  pricePrecision: 2,
  qtyPrecision: 2
});

const commodity = (name: string, symbol: string): SeedAsset => ({
  name,
  symbol,
  category: 'Commodities',
  description: `${name} futures contract.`,
  spotAvailable: false,
  futuresAvailable: true,
  copyTradingAvailable: false,
  demoAvailable: true,
  minOrder: 10,
  maxOrder: 250_000,
  tradingFee: '0.03%',
  leverageLimits: '20x',
  pricePrecision: 2,
  qtyPrecision: 2
});

const ASSETS: SeedAsset[] = [
  // Crypto — BTC/ETH/SOL already exist from the earlier seed.
  crypto('BNB', 'BNB/USDT', '75x'),
  crypto('Ripple', 'XRP/USDT', '75x', 4),
  crypto('Cardano', 'ADA/USDT', '50x', 4),
  crypto('Dogecoin', 'DOGE/USDT', '50x', 4, { isTrending: true }),
  crypto('Avalanche', 'AVAX/USDT', '50x'),
  crypto('Chainlink', 'LINK/USDT', '50x'),
  crypto('Polkadot', 'DOT/USDT', '50x'),
  crypto('Litecoin', 'LTC/USDT', '50x'),
  crypto('TRON', 'TRX/USDT', '25x', 4),
  crypto('Cosmos', 'ATOM/USDT', '25x'),
  crypto('Aptos', 'APT/USDT', '25x'),
  crypto('Sui Network', 'SUI/USDT', '25x', 4, { isNewListing: true }),

  // Forex majors & crosses
  forex('Euro / US Dollar', 'EUR/USD'),
  forex('British Pound / US Dollar', 'GBP/USD'),
  forex('US Dollar / Japanese Yen', 'USD/JPY', 2),
  forex('US Dollar / Swiss Franc', 'USD/CHF'),
  forex('Australian Dollar / US Dollar', 'AUD/USD'),
  forex('US Dollar / Canadian Dollar', 'USD/CAD'),
  forex('Euro / British Pound', 'EUR/GBP'),
  forex('Euro / Japanese Yen', 'EUR/JPY', 2),

  // Stocks
  stock('Apple Inc.', 'AAPL'),
  stock('Microsoft Corp.', 'MSFT'),
  stock('NVIDIA Corp.', 'NVDA', { isTrending: true }),
  stock('Amazon.com Inc.', 'AMZN'),
  stock('Alphabet Inc.', 'GOOGL'),
  stock('Meta Platforms Inc.', 'META'),
  stock('Tesla Inc.', 'TSLA', { isTrending: true }),
  stock('Netflix Inc.', 'NFLX'),
  stock('Advanced Micro Devices', 'AMD'),
  stock('JPMorgan Chase & Co.', 'JPM'),

  // ETFs
  etf('SPDR S&P 500 ETF Trust', 'SPY'),
  etf('Invesco QQQ Trust', 'QQQ'),
  etf('Vanguard Total Stock Market', 'VTI'),
  etf('Vanguard S&P 500 ETF', 'VOO'),
  etf('ARK Innovation ETF', 'ARKK'),

  // Indices
  index('S&P 500 Index', 'US500'),
  index('NASDAQ-100 Index', 'NAS100'),
  index('Dow Jones Industrial Average', 'US30'),
  index('FTSE 100 Index', 'UK100'),
  index('DAX 40 Index', 'GER40'),
  index('Nikkei 225 Index', 'JP225'),

  // Metals
  metal('Gold Spot', 'XAU/USD', { isFeatured: true }),
  metal('Silver Spot', 'XAG/USD'),
  metal('Platinum Spot', 'XPT/USD'),
  metal('Palladium Spot', 'XPD/USD'),

  // Energy
  energy('WTI Crude Oil', 'WTI'),
  energy('Brent Crude Oil', 'BRENT'),
  energy('Natural Gas', 'NATGAS'),

  // Agricultural commodities
  commodity('Corn Futures', 'CORN'),
  commodity('Wheat Futures', 'WHEAT')
];

const run = async () => {
  let inserted = 0;
  let skipped = 0;

  try {
    for (const asset of ASSETS) {
      const result = await pool.query(
        `INSERT INTO market_assets (
           name, symbol, category, description, status, spot_available, futures_available,
           copy_trading_available, demo_available, min_order, max_order, trading_fee,
           leverage_limits, price_precision, qty_precision, is_featured, is_trending, is_new_listing
         ) VALUES ($1, $2, $3, $4, 'Active', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (symbol) DO NOTHING
         RETURNING id;`,
        [
          asset.name,
          asset.symbol,
          asset.category,
          asset.description,
          asset.spotAvailable,
          asset.futuresAvailable,
          asset.copyTradingAvailable,
          asset.demoAvailable,
          asset.minOrder,
          asset.maxOrder,
          asset.tradingFee,
          asset.leverageLimits,
          asset.pricePrecision,
          asset.qtyPrecision,
          asset.isFeatured ?? false,
          asset.isTrending ?? false,
          asset.isNewListing ?? false
        ]
      );

      if (result.rows.length > 0) inserted++;
      else skipped++;
    }

    console.log(`Market directory seeded: ${inserted} inserted, ${skipped} already present.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding markets:', err);
    process.exit(1);
  }
};

run();
