import { CryptoCoin, LeadTrader, AcademyArticle, NotificationItem, WalletAsset, TraderReview } from './types';

export const INITIAL_COINS: CryptoCoin[] = [
  // --- CRYPTO ---
  { id: 'btc', symbol: 'BTC/USDT', name: 'Bitcoin', price: 92450.80, change24h: 3.82, high24h: 93800.00, low24h: 88900.50, volume24h: 18450200000, marketCap: 1820000000000, category: 'crypto', assetClass: 'crypto', sparkline: [88900, 89500, 90200, 89800, 91100, 92000, 92450], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'eth', symbol: 'ETH/USDT', name: 'Ethereum', price: 3480.25, change24h: 5.14, high24h: 3540.00, low24h: 3290.10, volume24h: 12200100000, marketCap: 418000000000, category: 'crypto', assetClass: 'crypto', sparkline: [3290, 3320, 3380, 3350, 3420, 3460, 3480], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'sol', symbol: 'SOL/USDT', name: 'Solana', price: 214.60, change24h: 8.75, high24h: 222.00, low24h: 194.20, volume24h: 8450000000, marketCap: 101000000000, category: 'crypto', assetClass: 'crypto', sparkline: [194, 198, 202, 200, 208, 212, 214.6], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'bnb', symbol: 'BNB/USDT', name: 'BNB', price: 685.40, change24h: 1.95, high24h: 692.00, low24h: 670.00, volume24h: 1950000000, marketCap: 99000000000, category: 'crypto', assetClass: 'crypto', sparkline: [670, 674, 678, 680, 682, 684, 685.4], precision: 2 },
  { id: 'xrp', symbol: 'XRP/USDT', name: 'Ripple', price: 2.45, change24h: -1.85, high24h: 2.62, low24h: 2.38, volume24h: 5800000000, marketCap: 139000000000, category: 'crypto', assetClass: 'crypto', sparkline: [2.58, 2.62, 2.52, 2.48, 2.42, 2.44, 2.45], precision: 4 },
  { id: 'ada', symbol: 'ADA/USDT', name: 'Cardano', price: 0.885, change24h: 2.40, high24h: 0.920, low24h: 0.850, volume24h: 1120000000, marketCap: 31500000000, category: 'crypto', assetClass: 'crypto', sparkline: [0.85, 0.86, 0.87, 0.865, 0.88, 0.882, 0.885], precision: 4 },
  { id: 'doge', symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.384, change24h: 12.40, high24h: 0.410, low24h: 0.332, volume24h: 4200000000, marketCap: 56000000000, category: 'crypto', assetClass: 'crypto', sparkline: [0.332, 0.345, 0.360, 0.352, 0.370, 0.380, 0.384], precision: 4, isTrending: true },
  { id: 'avax', symbol: 'AVAX/USDT', name: 'Avalanche', price: 42.10, change24h: 6.30, high24h: 43.80, low24h: 39.20, volume24h: 1450000000, marketCap: 17200000000, category: 'crypto', assetClass: 'crypto', sparkline: [39.2, 40.1, 40.8, 41.2, 41.8, 42.0, 42.1], precision: 2 },
  { id: 'link', symbol: 'LINK/USDT', name: 'Chainlink', price: 18.25, change24h: 4.10, high24h: 18.90, low24h: 17.30, volume24h: 980000000, marketCap: 11200000000, category: 'crypto', assetClass: 'crypto', sparkline: [17.3, 17.6, 17.9, 18.0, 18.1, 18.2, 18.25], precision: 2 },
  { id: 'dot', symbol: 'DOT/USDT', name: 'Polkadot', price: 9.42, change24h: 3.15, high24h: 9.80, low24h: 9.05, volume24h: 640000000, marketCap: 13200000000, category: 'crypto', assetClass: 'crypto', sparkline: [9.05, 9.15, 9.25, 9.30, 9.42], precision: 2 },
  { id: 'ltc', symbol: 'LTC/USDT', name: 'Litecoin', price: 104.50, change24h: 1.80, high24h: 108.20, low24h: 101.30, volume24h: 520000000, marketCap: 7800000000, category: 'crypto', assetClass: 'crypto', sparkline: [101.3, 102.5, 103.8, 104.5], precision: 2 },
  { id: 'trx', symbol: 'TRX/USDT', name: 'TRON', price: 0.245, change24h: 0.85, high24h: 0.252, low24h: 0.239, volume24h: 410000000, marketCap: 21200000000, category: 'crypto', assetClass: 'crypto', sparkline: [0.239, 0.241, 0.243, 0.245], precision: 4 },
  { id: 'atom', symbol: 'ATOM/USDT', name: 'Cosmos', price: 8.90, change24h: 4.25, high24h: 9.20, low24h: 8.45, volume24h: 280000000, marketCap: 3500000000, category: 'crypto', assetClass: 'crypto', sparkline: [8.45, 8.60, 8.75, 8.90], precision: 2 },
  { id: 'apt', symbol: 'APT/USDT', name: 'Aptos', price: 12.80, change24h: 7.40, high24h: 13.20, low24h: 11.80, volume24h: 890000000, marketCap: 6500000000, category: 'crypto', assetClass: 'crypto', sparkline: [11.8, 12.1, 12.4, 12.6, 12.8], precision: 2 },
  { id: 'sui', symbol: 'SUI/USDT', name: 'Sui Network', price: 3.65, change24h: 14.20, high24h: 3.82, low24h: 3.12, volume24h: 3100000000, marketCap: 10500000000, category: 'crypto', assetClass: 'crypto', sparkline: [3.12, 3.25, 3.40, 3.38, 3.55, 3.62, 3.65], precision: 4, isNew: true },
  { id: 'ton', symbol: 'TON/USDT', name: 'Toncoin', price: 5.82, change24h: -1.10, high24h: 6.05, low24h: 5.75, volume24h: 720000000, marketCap: 14800000000, category: 'crypto', assetClass: 'crypto', sparkline: [6.05, 5.95, 5.88, 5.82], precision: 2 },
  { id: 'pepe', symbol: 'PEPE/USDT', name: 'Pepe Coin', price: 0.0000215, change24h: -4.30, high24h: 0.0000238, low24h: 0.0000201, volume24h: 2900000000, marketCap: 9100000000, category: 'crypto', assetClass: 'crypto', sparkline: [0.000023, 0.0000235, 0.000022, 0.000021, 0.0000205, 0.0000212, 0.0000215], precision: 8 },
  { id: 'shib', symbol: 'SHIB/USDT', name: 'Shiba Inu', price: 0.0000254, change24h: 1.80, high24h: 0.0000268, low24h: 0.0000242, volume24h: 1650000000, marketCap: 15000000000, category: 'crypto', assetClass: 'crypto', sparkline: [0.0000242, 0.0000248, 0.000025, 0.0000252, 0.0000254], precision: 8 },

  // --- FOREX ---
  { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0845, change24h: 0.22, high24h: 1.0870, low24h: 1.0812, volume24h: 94000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [1.0812, 1.0825, 1.0838, 1.0845], precision: 4, isMostTraded: true },
  { id: 'gbpusd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2980, change24h: -0.15, high24h: 1.3025, low24h: 1.2950, volume24h: 68000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [1.3025, 1.3000, 1.2990, 1.2980], precision: 4, isMostTraded: true },
  { id: 'usdjpy', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 154.20, change24h: 0.65, high24h: 154.80, low24h: 153.10, volume24h: 75000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [153.1, 153.6, 153.9, 154.2], precision: 2, isMostTraded: true },
  { id: 'usdchf', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', price: 0.8840, change24h: -0.12, high24h: 0.8875, low24h: 0.8820, volume24h: 32000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [0.8875, 0.8860, 0.8845, 0.8840], precision: 4 },
  { id: 'audusd', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6580, change24h: 0.45, high24h: 0.6610, low24h: 0.6540, volume24h: 41000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [0.6540, 0.6555, 0.6570, 0.6580], precision: 4 },
  { id: 'nzdusd', symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', price: 0.5920, change24h: 0.18, high24h: 0.5950, low24h: 0.5890, volume24h: 22000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [0.5890, 0.5905, 0.5915, 0.5920], precision: 4 },
  { id: 'usdcad', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.3920, change24h: -0.28, high24h: 1.3980, low24h: 1.3890, volume24h: 38000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [1.3980, 1.3960, 1.3935, 1.3920], precision: 4 },
  { id: 'eurgbp', symbol: 'EUR/GBP', name: 'Euro / British Pound', price: 0.8355, change24h: 0.38, high24h: 0.8380, low24h: 0.8320, volume24h: 28000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [0.8320, 0.8335, 0.8348, 0.8355], precision: 4 },
  { id: 'eurjpy', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', price: 167.25, change24h: 0.88, high24h: 167.90, low24h: 165.80, volume24h: 35000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [165.8, 166.2, 166.8, 167.25], precision: 2 },
  { id: 'gbpjpy', symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', price: 200.15, change24h: 0.52, high24h: 201.20, low24h: 198.90, volume24h: 42000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [198.9, 199.4, 199.8, 200.15], precision: 2, isTrending: true },
  { id: 'audjpy', symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', price: 101.45, change24h: 1.10, high24h: 102.10, low24h: 100.20, volume24h: 19000000000, marketCap: 0, category: 'forex', assetClass: 'forex', sparkline: [100.2, 100.7, 101.1, 101.45], precision: 2 },

  // --- STOCKS ---
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', price: 232.50, change24h: 2.15, high24h: 235.00, low24h: 228.40, volume24h: 12500000000, marketCap: 3550000000000, category: 'stocks', assetClass: 'stocks', sparkline: [228.4, 229.8, 231.2, 232.5], precision: 2, isMostTraded: true },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', price: 428.10, change24h: 1.45, high24h: 432.00, low24h: 422.50, volume24h: 9800000000, marketCap: 3180000000000, category: 'stocks', assetClass: 'stocks', sparkline: [422.5, 424.8, 426.5, 428.1], precision: 2, isMostTraded: true },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 138.80, change24h: 4.85, high24h: 142.00, low24h: 132.10, volume24h: 28500000000, marketCap: 3420000000000, category: 'stocks', assetClass: 'stocks', sparkline: [132.1, 134.5, 137.0, 138.8], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 188.40, change24h: 2.80, high24h: 191.20, low24h: 183.50, volume24h: 11200000000, marketCap: 1960000000000, category: 'stocks', assetClass: 'stocks', sparkline: [183.5, 185.2, 187.0, 188.4], precision: 2 },
  { id: 'googl', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 168.20, change24h: -0.85, high24h: 171.00, low24h: 166.80, volume24h: 7400000000, marketCap: 2080000000000, category: 'stocks', assetClass: 'stocks', sparkline: [171.0, 169.8, 168.9, 168.2], precision: 2 },
  { id: 'meta', symbol: 'META', name: 'Meta Platforms Inc.', price: 585.60, change24h: 3.42, high24h: 592.00, low24h: 568.10, volume24h: 14200000000, marketCap: 1480000000000, category: 'stocks', assetClass: 'stocks', sparkline: [568.1, 574.0, 581.2, 585.6], precision: 2, isTrending: true },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', price: 254.20, change24h: 6.90, high24h: 262.00, low24h: 238.00, volume24h: 22100000000, marketCap: 810000000000, category: 'stocks', assetClass: 'stocks', sparkline: [238.0, 242.5, 249.0, 254.2], precision: 2, isTrending: true },
  { id: 'nflx', symbol: 'NFLX', name: 'Netflix Inc.', price: 712.50, change24h: 1.88, high24h: 720.00, low24h: 698.00, volume24h: 5200000000, marketCap: 308000000000, category: 'stocks', assetClass: 'stocks', sparkline: [698.0, 704.0, 709.5, 712.5], precision: 2 },
  { id: 'amd', symbol: 'AMD', name: 'Advanced Micro Devices', price: 156.40, change24h: 3.82, high24h: 160.20, low24h: 150.10, volume24h: 8900000000, marketCap: 253000000000, category: 'stocks', assetClass: 'stocks', sparkline: [150.1, 152.4, 154.8, 156.4], precision: 2 },
  { id: 'intc', symbol: 'INTC', name: 'Intel Corp.', price: 22.80, change24h: -2.15, high24h: 23.50, low24h: 22.10, volume24h: 4200000000, marketCap: 97000000000, category: 'stocks', assetClass: 'stocks', sparkline: [23.5, 23.1, 22.9, 22.8], precision: 2 },
  { id: 'orcl', symbol: 'ORCL', name: 'Oracle Corp.', price: 172.50, change24h: 2.30, high24h: 175.00, low24h: 168.40, volume24h: 3800000000, marketCap: 475000000000, category: 'stocks', assetClass: 'stocks', sparkline: [168.4, 170.0, 171.2, 172.5], precision: 2 },
  { id: 'crm', symbol: 'CRM', name: 'Salesforce Inc.', price: 288.90, change24h: 0.95, high24h: 292.00, low24h: 285.00, volume24h: 3100000000, marketCap: 278000000000, category: 'stocks', assetClass: 'stocks', sparkline: [285.0, 286.5, 287.8, 288.9], precision: 2 },
  { id: 'v', symbol: 'V', name: 'Visa Inc.', price: 292.40, change24h: 0.62, high24h: 294.50, low24h: 290.10, volume24h: 2900000000, marketCap: 598000000000, category: 'stocks', assetClass: 'stocks', sparkline: [290.1, 291.0, 291.8, 292.4], precision: 2 },
  { id: 'ma', symbol: 'MA', name: 'Mastercard Inc.', price: 504.80, change24h: 0.85, high24h: 508.00, low24h: 499.20, volume24h: 2600000000, marketCap: 468000000000, category: 'stocks', assetClass: 'stocks', sparkline: [499.2, 501.0, 503.2, 504.8], precision: 2 },
  { id: 'jpm', symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 222.10, change24h: 1.15, high24h: 224.50, low24h: 219.00, volume24h: 4800000000, marketCap: 632000000000, category: 'stocks', assetClass: 'stocks', sparkline: [219.0, 220.2, 221.4, 222.1], precision: 2 },
  { id: 'gs', symbol: 'GS', name: 'Goldman Sachs Group', price: 524.30, change24h: 1.82, high24h: 529.00, low24h: 514.00, volume24h: 2400000000, marketCap: 172000000000, category: 'stocks', assetClass: 'stocks', sparkline: [514.0, 518.0, 521.5, 524.3], precision: 2 },
  { id: 'jnj', symbol: 'JNJ', name: 'Johnson & Johnson', price: 161.20, change24h: -0.42, high24h: 162.80, low24h: 160.50, volume24h: 2100000000, marketCap: 388000000000, category: 'stocks', assetClass: 'stocks', sparkline: [162.8, 162.0, 161.5, 161.2], precision: 2 },
  { id: 'ko', symbol: 'KO', name: 'Coca-Cola Co.', price: 68.40, change24h: 0.35, high24h: 69.10, low24h: 68.00, volume24h: 1800000000, marketCap: 294000000000, category: 'stocks', assetClass: 'stocks', sparkline: [68.0, 68.1, 68.3, 68.4], precision: 2 },
  { id: 'mcd', symbol: 'MCD', name: "McDonald's Corp.", price: 296.50, change24h: 0.90, high24h: 298.80, low24h: 293.20, volume24h: 2200000000, marketCap: 212000000000, category: 'stocks', assetClass: 'stocks', sparkline: [293.2, 294.5, 295.8, 296.5], precision: 2 },
  { id: 'wmt', symbol: 'WMT', name: 'Walmart Inc.', price: 82.30, change24h: 1.25, high24h: 83.10, low24h: 81.20, volume24h: 3100000000, marketCap: 662000000000, category: 'stocks', assetClass: 'stocks', sparkline: [81.2, 81.6, 82.0, 82.3], precision: 2 },
  { id: 'dis', symbol: 'DIS', name: 'Walt Disney Co.', price: 96.80, change24h: -1.10, high24h: 98.40, low24h: 95.90, volume24h: 2700000000, marketCap: 176000000000, category: 'stocks', assetClass: 'stocks', sparkline: [98.4, 97.5, 97.0, 96.8], precision: 2 },

  // --- ETFs ---
  { id: 'spy', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 582.40, change24h: 1.12, high24h: 585.20, low24h: 575.80, volume24h: 34000000000, marketCap: 580000000000, category: 'etfs', assetClass: 'etfs', sparkline: [575.8, 578.0, 580.5, 582.4], precision: 2, isMostTraded: true },
  { id: 'qqq', symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 494.60, change24h: 1.68, high24h: 498.00, low24h: 486.20, volume24h: 28000000000, marketCap: 290000000000, category: 'etfs', assetClass: 'etfs', sparkline: [486.2, 489.0, 492.1, 494.6], precision: 2, isMostTraded: true },
  { id: 'vti', symbol: 'VTI', name: 'Vanguard Total Stock Market', price: 284.10, change24h: 1.05, high24h: 285.80, low24h: 281.00, volume24h: 8900000000, marketCap: 410000000000, category: 'etfs', assetClass: 'etfs', sparkline: [281.0, 282.2, 283.4, 284.1], precision: 2 },
  { id: 'voo', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 535.80, change24h: 1.14, high24h: 538.50, low24h: 529.60, volume24h: 11200000000, marketCap: 490000000000, category: 'etfs', assetClass: 'etfs', sparkline: [529.6, 531.8, 534.0, 535.8], precision: 2 },
  { id: 'iwm', symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 222.90, change24h: 1.85, high24h: 225.10, low24h: 218.60, volume24h: 9400000000, marketCap: 72000000000, category: 'etfs', assetClass: 'etfs', sparkline: [218.6, 220.0, 221.8, 222.9], precision: 2 },
  { id: 'dia', symbol: 'DIA', name: 'SPDR Dow Jones Industrial ETF', price: 428.50, change24h: 0.68, high24h: 431.00, low24h: 425.20, volume24h: 4800000000, marketCap: 35000000000, category: 'etfs', assetClass: 'etfs', sparkline: [425.2, 426.5, 427.8, 428.5], precision: 2 },
  { id: 'arkk', symbol: 'ARKK', name: 'ARK Innovation ETF', price: 52.40, change24h: 3.85, high24h: 54.10, low24h: 50.20, volume24h: 3800000000, marketCap: 6800000000, category: 'etfs', assetClass: 'etfs', sparkline: [50.2, 51.0, 51.8, 52.4], precision: 2 },
  { id: 'xlf', symbol: 'XLF', name: 'Financial Select Sector SPDR', price: 46.80, change24h: 0.92, high24h: 47.30, low24h: 46.20, volume24h: 6200000000, marketCap: 42000000000, category: 'etfs', assetClass: 'etfs', sparkline: [46.2, 46.4, 46.6, 46.8], precision: 2 },
  { id: 'xle', symbol: 'XLE', name: 'Energy Select Sector SPDR', price: 91.20, change24h: -1.20, high24h: 92.80, low24h: 90.50, volume24h: 5100000000, marketCap: 38000000000, category: 'etfs', assetClass: 'etfs', sparkline: [92.8, 92.0, 91.5, 91.2], precision: 2 },
  { id: 'xlk', symbol: 'XLK', name: 'Technology Select Sector SPDR', price: 232.10, change24h: 2.15, high24h: 235.00, low24h: 227.00, volume24h: 7800000000, marketCap: 74000000000, category: 'etfs', assetClass: 'etfs', sparkline: [227.0, 228.8, 230.5, 232.1], precision: 2 },

  // --- INDICES ---
  { id: 'us500', symbol: 'US500', name: 'S&P 500 Index', price: 5860.20, change24h: 1.15, high24h: 5885.00, low24h: 5790.00, volume24h: 48000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [5790, 5815, 5840, 5860.2], precision: 2, isMostTraded: true },
  { id: 'nas100', symbol: 'NAS100', name: 'NASDAQ-100 Index', price: 20450.80, change24h: 1.72, high24h: 20600.00, low24h: 20100.00, volume24h: 52000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [20100, 20220, 20380, 20450.8], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'us30', symbol: 'US30', name: 'Dow Jones Industrial Average', price: 42890.50, change24h: 0.65, high24h: 43100.00, low24h: 42600.00, volume24h: 31000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [42600, 42720, 42810, 42890.5], precision: 2 },
  { id: 'uk100', symbol: 'UK100', name: 'FTSE 100 Index', price: 8240.30, change24h: 0.42, high24h: 8280.00, low24h: 8200.00, volume24h: 14000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [8200, 8215, 8230, 8240.3], precision: 2 },
  { id: 'ger40', symbol: 'GER40', name: 'DAX 40 Index', price: 19480.60, change24h: 0.88, high24h: 19590.00, low24h: 19300.00, volume24h: 18000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [19300, 19380, 19440, 19480.6], precision: 2 },
  { id: 'fra40', symbol: 'FRA40', name: 'CAC 40 Index', price: 7520.10, change24h: 0.35, high24h: 7560.00, low24h: 7490.00, volume24h: 11000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [7490, 7500, 7512, 7520.1], precision: 2 },
  { id: 'jp225', symbol: 'JP225', name: 'Nikkei 225 Index', price: 38920.00, change24h: 1.45, high24h: 39200.00, low24h: 38350.00, volume24h: 22000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [38350, 38580, 38790, 38920], precision: 2, isTrending: true },
  { id: 'hk50', symbol: 'HK50', name: 'Hang Seng Index', price: 20680.40, change24h: -0.92, high24h: 21000.00, low24h: 20500.00, volume24h: 19000000000, marketCap: 0, category: 'indices', assetClass: 'indices', sparkline: [21000, 20850, 20740, 20680.4], precision: 2 },

  // --- COMMODITIES & METALS & ENERGY ---
  { id: 'xauusd', symbol: 'XAU/USD', name: 'Gold Spot', price: 2745.20, change24h: 1.25, high24h: 2758.00, low24h: 2710.00, volume24h: 62000000000, marketCap: 16500000000000, category: 'commodities', assetClass: 'metals', sparkline: [2710, 2722, 2736, 2745.2], precision: 2, isTrending: true, isMostTraded: true },
  { id: 'xagusd', symbol: 'XAG/USD', name: 'Silver Spot', price: 31.80, change24h: 2.10, high24h: 32.40, low24h: 30.90, volume24h: 18000000000, marketCap: 1800000000000, category: 'commodities', assetClass: 'metals', sparkline: [30.9, 31.2, 31.5, 31.8], precision: 2 },
  { id: 'copper', symbol: 'COPPER', name: 'High Grade Copper', price: 4.35, change24h: 0.82, high24h: 4.42, low24h: 4.28, volume24h: 8400000000, marketCap: 0, category: 'commodities', assetClass: 'metals', sparkline: [4.28, 4.30, 4.33, 4.35], precision: 2 },
  { id: 'xptusd', symbol: 'XPT/USD', name: 'Platinum Spot', price: 985.40, change24h: 0.95, high24h: 998.00, low24h: 972.00, volume24h: 4100000000, marketCap: 0, category: 'commodities', assetClass: 'metals', sparkline: [972, 978, 982, 985.4], precision: 2 },
  { id: 'xpdusd', symbol: 'XPD/USD', name: 'Palladium Spot', price: 1045.00, change24h: -1.15, high24h: 1068.00, low24h: 1035.00, volume24h: 2900000000, marketCap: 0, category: 'commodities', assetClass: 'metals', sparkline: [1068, 1058, 1050, 1045], precision: 2 },
  { id: 'wti', symbol: 'WTI', name: 'WTI Crude Oil', price: 71.40, change24h: -1.85, high24h: 73.20, low24h: 70.80, volume24h: 38000000000, marketCap: 0, category: 'energy', assetClass: 'energy', sparkline: [73.2, 72.5, 71.9, 71.4], precision: 2, isMostTraded: true },
  { id: 'brent', symbol: 'BRENT', name: 'Brent Crude Oil', price: 75.20, change24h: -1.62, high24h: 76.90, low24h: 74.60, volume24h: 42000000000, marketCap: 0, category: 'energy', assetClass: 'energy', sparkline: [76.9, 76.1, 75.6, 75.2], precision: 2, isMostTraded: true },
  { id: 'natgas', symbol: 'NATGAS', name: 'Natural Gas', price: 2.85, change24h: 4.12, high24h: 2.94, low24h: 2.71, volume24h: 12000000000, marketCap: 0, category: 'energy', assetClass: 'energy', sparkline: [2.71, 2.76, 2.81, 2.85], precision: 2, isTrending: true },
  { id: 'hoil', symbol: 'HOIL', name: 'Heating Oil', price: 2.25, change24h: -0.88, high24h: 2.29, low24h: 2.22, volume24h: 3100000000, marketCap: 0, category: 'energy', assetClass: 'energy', sparkline: [2.29, 2.27, 2.26, 2.25], precision: 2 },
  { id: 'gasoline', symbol: 'GASOLINE', name: 'RBOB Gasoline', price: 2.12, change24h: -1.05, high24h: 2.16, low24h: 2.09, volume24h: 2800000000, marketCap: 0, category: 'energy', assetClass: 'energy', sparkline: [2.16, 2.14, 2.13, 2.12], precision: 2 },
  { id: 'corn', symbol: 'CORN', name: 'Corn Futures', price: 418.50, change24h: 0.60, high24h: 422.00, low24h: 414.00, volume24h: 2100000000, marketCap: 0, category: 'commodities', assetClass: 'commodities', sparkline: [414, 415.5, 417, 418.5], precision: 2 },
  { id: 'wheat', symbol: 'WHEAT', name: 'Wheat Futures', price: 572.00, change24h: 1.25, high24h: 580.00, low24h: 562.00, volume24h: 2400000000, marketCap: 0, category: 'commodities', assetClass: 'commodities', sparkline: [562, 566, 570, 572], precision: 2 },
  { id: 'soybean', symbol: 'SOYBEAN', name: 'Soybeans Futures', price: 998.00, change24h: -0.45, high24h: 1008.00, low24h: 992.00, volume24h: 2900000000, marketCap: 0, category: 'commodities', assetClass: 'commodities', sparkline: [1008, 1002, 999, 998], precision: 2 },
  { id: 'coffee', symbol: 'COFFEE', name: 'Coffee Arabica', price: 248.50, change24h: 3.12, high24h: 252.00, low24h: 239.00, volume24h: 1800000000, marketCap: 0, category: 'commodities', assetClass: 'commodities', sparkline: [239, 242, 245, 248.5], precision: 2 },

  // --- BONDS ---
  { id: 'us10y', symbol: 'US10Y', name: 'US Treasury 10Y Yield', price: 4.22, change24h: -0.85, high24h: 4.28, low24h: 4.19, volume24h: 15000000000, marketCap: 0, category: 'bonds', assetClass: 'bonds', sparkline: [4.28, 4.25, 4.23, 4.22], precision: 2 },
  { id: 'us30y', symbol: 'US30Y', name: 'US Treasury 30Y Bond', price: 4.48, change24h: -0.62, high24h: 4.52, low24h: 4.45, volume24h: 11000000000, marketCap: 0, category: 'bonds', assetClass: 'bonds', sparkline: [4.52, 4.50, 4.49, 4.48], precision: 2 },
  { id: 'bund', symbol: 'BUND', name: 'German 10Y Bund Yield', price: 2.28, change24h: -0.42, high24h: 2.32, low24h: 2.25, volume24h: 8200000000, marketCap: 0, category: 'bonds', assetClass: 'bonds', sparkline: [2.32, 2.30, 2.29, 2.28], precision: 2 }
];

export const MOCK_REVIEWS_ALEX: TraderReview[] = [
  {
    id: 'rev-1',
    traderId: 'trader-1',
    copierName: 'David K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    comment: 'Alex has kept my copy portfolio in solid green for 3 consecutive months. Incredible risk management during volatile dips!',
    roi: 142.5,
    date: '2026-08-01',
    helpfulCount: 38,
    verifiedCopier: true,
    status: 'approved'
  },
  {
    id: 'rev-2',
    traderId: 'trader-1',
    copierName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    comment: 'Always sets tight stop losses and never over-leverages. The best lead trader on Oriviant.',
    roi: 98.2,
    date: '2026-07-28',
    helpfulCount: 24,
    verifiedCopier: true,
    status: 'approved'
  }
];

export const MOCK_LEAD_TRADERS: LeadTrader[] = [
  {
    id: 'trader-1',
    name: 'Alex Vance (Alpha Capital)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    verified: true,
    badges: ['Top Performer', 'Risk Master', '5-Star Lead'],
    winRate: 88.4,
    roi7d: 28.5,
    roi30d: 184.2,
    aum: 2450000,
    followers: 498,
    maxFollowers: 500,
    riskScore: 2,
    description: 'Systematic Macro Trend Trading focusing on BTC & ETH perp futures. Max leverage capped at 5x. Strictly disciplined TP/SL.',
    totalTrades: 342,
    profitableTrades: 302,
    performanceChart: [100, 112, 125, 120, 145, 168, 184.2],
    reviews: MOCK_REVIEWS_ALEX,
    status: 'active'
  },
  {
    id: 'trader-2',
    name: 'Sophia Chen (Quantum Trades)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    verified: true,
    badges: ['High ROI', 'AI Analyst'],
    winRate: 82.1,
    roi7d: 34.2,
    roi30d: 215.8,
    aum: 1820000,
    followers: 412,
    maxFollowers: 500,
    riskScore: 4,
    description: 'Algorithmic momentum trader targeting high-beta Altcoins & Layer 1 tokens. High frequency with strict risk bounds.',
    totalTrades: 512,
    profitableTrades: 420,
    performanceChart: [100, 118, 132, 148, 175, 198, 215.8],
    reviews: [],
    status: 'active'
  },
  {
    id: 'trader-3',
    name: 'Marcus Sterling',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    verified: true,
    badges: ['Low Drawdown', 'Veteran'],
    winRate: 91.5,
    roi7d: 14.8,
    roi30d: 94.6,
    aum: 3100000,
    followers: 500,
    maxFollowers: 500,
    riskScore: 1,
    description: 'Institutional hedged arbitrage & spot momentum strategy. Zero liquidation record over 3 years.',
    totalTrades: 198,
    profitableTrades: 181,
    performanceChart: [100, 108, 115, 122, 135, 142, 194.6],
    reviews: [],
    status: 'active'
  },
  {
    id: 'trader-4',
    name: 'Satoshi_Whale_Hunter',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150',
    verified: false,
    badges: ['Breakout Specialist'],
    winRate: 76.4,
    roi7d: 45.1,
    roi30d: 310.5,
    aum: 980000,
    followers: 289,
    maxFollowers: 500,
    riskScore: 6,
    description: 'Aggressive swing trading on volume breakouts. High leverage options for experienced copiers.',
    totalTrades: 275,
    profitableTrades: 210,
    performanceChart: [100, 125, 140, 110, 190, 240, 310.5],
    reviews: [],
    status: 'active'
  },
  {
    id: 'trader-5',
    name: 'Aria Horizon',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    verified: true,
    badges: ['DeFi Maven', 'Consistent Yield'],
    winRate: 85.0,
    roi7d: 19.4,
    roi30d: 128.0,
    aum: 1450000,
    followers: 380,
    maxFollowers: 500,
    riskScore: 3,
    description: 'DeFi sector focus & DEX ecosystem catalyst momentum. Steady compounding strategy.',
    totalTrades: 164,
    profitableTrades: 139,
    performanceChart: [100, 106, 114, 120, 122, 125, 128.0],
    reviews: [],
    status: 'active'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Demo Wallet Activated',
    message: 'Welcome to Oriviant! You have received $10,000 USDT in Demo Trading funds.',
    timestamp: 'Just now',
    category: 'system',
    read: false,
    linkTab: 'demo-workspace'
  },
  {
    id: 'notif-2',
    title: 'BTC/USDT Breakout Alert',
    message: 'Bitcoin crossed $92,000 with a 3.82% 24h gain.',
    timestamp: '15 mins ago',
    category: 'alert',
    read: false,
    linkTab: 'spot'
  },
  {
    id: 'notif-3',
    title: 'Copy Trading Weekly Report',
    message: 'Your copied trader Alex Vance achieved +28.5% ROI this week.',
    timestamp: '2 hours ago',
    category: 'copy',
    read: true,
    linkTab: 'copy-trading'
  }
];

export const MOCK_ACADEMY_ARTICLES: AcademyArticle[] = [
  {
    id: 'art-1',
    title: 'Complete Guide to Crypto Spot & Futures Trading',
    summary: 'Master order types, leverage limits, risk-to-reward ratios, and market mechanics.',
    category: 'Beginner',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400',
    content: [
      'Spot trading involves directly purchasing crypto assets at live market prices. Futures contracts, on the other hand, allow traders to speculate on asset direction with leverage without holding underlying coins.',
      'Understanding Margin: Cross margin shares collateral across all active open positions, whereas Isolated margin locks a fixed collateral amount strictly per position to cap maximum risk.',
      'Position Sizing: Always calculate liquidation price before opening high-leverage orders. Using strict Stop Losses preserves your capital against flash market drops.'
    ],
    keyTakeaways: [
      'Spot is direct ownership; Futures uses leverage.',
      'Isolated margin protects account balance from single-trade liquidations.',
      'Maintain a minimum 1:2 risk-to-reward ratio on every trade setup.'
    ]
  },
  {
    id: 'art-2',
    title: 'Mastering Risk Management with Demo Trading',
    summary: 'How to utilize your $10,000 Oriviant Demo Balance to test strategies before live execution.',
    category: 'Guide',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400',
    content: [
      'Demo mode on Oriviant provides a 1:1 real-time market simulator matching live orderbooks.',
      'Treat your virtual $10k balance like real capital. Set position sizing to 1-2% per trade setup to practice real psychological discipline.',
      'Use the Virtual Ledger and Performance Analytics to track win rates, drawdowns, and profit factors.'
    ],
    keyTakeaways: [
      'Never risk more than 2% of virtual equity per trade.',
      'Refill demo funds anytime if testing extreme scenarios.',
      'Review your trade history weekly to optimize entries.'
    ]
  },
  {
    id: 'art-3',
    title: 'Copy Trading Strategies: Selecting the Right Lead Trader',
    summary: 'Analyze win rates, AUM growth, maximum drawdown, and risk scores to build a resilient copy portfolio.',
    category: 'Intermediate',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400',
    content: [
      'Look beyond pure 30-day ROI. A trader with 500% ROI but a Risk Score of 9 may be using 100x leverage without stop losses.',
      'Prioritize Lead Traders with high win rates, steady equity growth curves, and low risk scores (1-3).',
      'Set automated Stop-Copy thresholds at 15-20% portfolio loss to safeguard your capital.'
    ],
    keyTakeaways: [
      'Combine low-risk lead traders with medium-risk growth traders.',
      'Always use the Copy Allocation slider to limit exposure per trader.',
      'Check copier reviews and verified performance metrics.'
    ]
  }
];

export const INITIAL_WALLET_ASSETS: WalletAsset[] = [
  { symbol: 'USDT', name: 'Tether USD', icon: '₮', total: 10000.00, available: 9425.00, inOrder: 575.00, valueUsdt: 10000.00, change24h: 0.00 },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', total: 0.45, available: 0.45, inOrder: 0.00, valueUsdt: 41602.86, change24h: 3.82 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', total: 4.20, available: 3.80, inOrder: 0.40, valueUsdt: 14617.05, change24h: 5.14 },
  { symbol: 'SOL', name: 'Solana', icon: 'S', total: 35.00, available: 35.00, inOrder: 0.00, valueUsdt: 7511.00, change24h: 8.75 }
];
