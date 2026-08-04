import { CryptoCoin, LeadTrader, AcademyArticle, NotificationItem, WalletAsset, TraderReview } from './types';

export const INITIAL_COINS: CryptoCoin[] = [
  { id: 'btc', symbol: 'BTC/USDT', name: 'Bitcoin', price: 92450.80, change24h: 3.82, high24h: 93800.00, low24h: 88900.50, volume24h: 18450200000, marketCap: 1820000000000, category: 'spot', sparkline: [88900, 89500, 90200, 89800, 91100, 92000, 92450], precision: 2, fundingRate: 0.0100, nextFundingIn: '03:45:12', openInterest: 4850000000 },
  { id: 'eth', symbol: 'ETH/USDT', name: 'Ethereum', price: 3480.25, change24h: 5.14, high24h: 3540.00, low24h: 3290.10, volume24h: 12200100000, marketCap: 418000000000, category: 'spot', sparkline: [3290, 3320, 3380, 3350, 3420, 3460, 3480], precision: 2, fundingRate: 0.0125, nextFundingIn: '03:45:12', openInterest: 2900000000 },
  { id: 'sol', symbol: 'SOL/USDT', name: 'Solana', price: 214.60, change24h: 8.75, high24h: 222.00, low24h: 194.20, volume24h: 8450000000, marketCap: 101000000000, category: 'layer1', sparkline: [194, 198, 202, 200, 208, 212, 214.6], precision: 2, fundingRate: 0.0150, nextFundingIn: '03:45:12', openInterest: 1800000000 },
  { id: 'xrp', symbol: 'XRP/USDT', name: 'Ripple', price: 2.45, change24h: -1.85, high24h: 2.62, low24h: 2.38, volume24h: 5800000000, marketCap: 139000000000, category: 'layer1', sparkline: [2.58, 2.62, 2.52, 2.48, 2.42, 2.44, 2.45], precision: 4, fundingRate: 0.0080, nextFundingIn: '03:45:12', openInterest: 920000000 },
  { id: 'doge', symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.384, change24h: 12.40, high24h: 0.410, low24h: 0.332, volume24h: 4200000000, marketCap: 56000000000, category: 'meme', sparkline: [0.332, 0.345, 0.360, 0.352, 0.370, 0.380, 0.384], precision: 4, fundingRate: 0.0210, nextFundingIn: '03:45:12', openInterest: 650000000 },
  { id: 'bnb', symbol: 'BNB/USDT', name: 'BNB', price: 685.40, change24h: 1.95, high24h: 692.00, low24h: 670.00, volume24h: 1950000000, marketCap: 99000000000, category: 'layer1', sparkline: [670, 674, 678, 680, 682, 684, 685.4], precision: 2, fundingRate: 0.0090, nextFundingIn: '03:45:12', openInterest: 410000000 },
  { id: 'sui', symbol: 'SUI/USDT', name: 'Sui Network', price: 3.65, change24h: 14.20, high24h: 3.82, low24h: 3.12, volume24h: 3100000000, marketCap: 10500000000, category: 'layer1', sparkline: [3.12, 3.25, 3.40, 3.38, 3.55, 3.62, 3.65], precision: 4, fundingRate: 0.0180, nextFundingIn: '03:45:12', openInterest: 540000000 },
  { id: 'pepe', symbol: 'PEPE/USDT', name: 'Pepe Coin', price: 0.0000215, change24h: -4.30, high24h: 0.0000238, low24h: 0.0000201, volume24h: 2900000000, marketCap: 9100000000, category: 'meme', sparkline: [0.000023, 0.0000235, 0.000022, 0.000021, 0.0000205, 0.0000212, 0.0000215], precision: 8, fundingRate: 0.0110, nextFundingIn: '03:45:12', openInterest: 380000000 },
  { id: 'avax', symbol: 'AVAX/USDT', name: 'Avalanche', price: 42.10, change24h: 6.30, high24h: 43.80, low24h: 39.20, volume24h: 1450000000, marketCap: 17200000000, category: 'layer1', sparkline: [39.2, 40.1, 40.8, 41.2, 41.8, 42.0, 42.1], precision: 2, fundingRate: 0.0105, nextFundingIn: '03:45:12', openInterest: 290000000 },
  { id: 'render', symbol: 'RENDER/USDT', name: 'Render Network', price: 8.95, change24h: 18.40, high24h: 9.30, low24h: 7.40, volume24h: 1880000000, marketCap: 4700000000, category: 'ai', sparkline: [7.4, 7.8, 8.2, 8.1, 8.6, 8.8, 8.95], precision: 3, fundingRate: 0.0240, nextFundingIn: '03:45:12', openInterest: 310000000 },
  { id: 'link', symbol: 'LINK/USDT', name: 'Chainlink', price: 18.25, change24h: 4.10, high24h: 18.90, low24h: 17.30, volume24h: 980000000, marketCap: 11200000000, category: 'defi', sparkline: [17.3, 17.6, 17.9, 18.0, 18.1, 18.2, 18.25], precision: 2, fundingRate: 0.0095, nextFundingIn: '03:45:12', openInterest: 210000000 },
  { id: 'near', symbol: 'NEAR/USDT', name: 'NEAR Protocol', price: 6.85, change24h: 9.12, high24h: 7.15, low24h: 6.20, volume24h: 1240000000, marketCap: 8300000000, category: 'ai', sparkline: [6.2, 6.4, 6.6, 6.5, 6.7, 6.8, 6.85], precision: 3, fundingRate: 0.0130, nextFundingIn: '03:45:12', openInterest: 260000000 },
  { id: 'ada', symbol: 'ADA/USDT', name: 'Cardano', price: 0.885, change24h: 2.40, high24h: 0.920, low24h: 0.850, volume24h: 1120000000, marketCap: 31500000000, category: 'layer1', sparkline: [0.85, 0.86, 0.87, 0.865, 0.88, 0.882, 0.885], precision: 4, fundingRate: 0.0075, nextFundingIn: '03:45:12', openInterest: 340000000 },
  { id: 'shib', symbol: 'SHIB/USDT', name: 'Shiba Inu', price: 0.0000254, change24h: 1.80, high24h: 0.0000268, low24h: 0.0000242, volume24h: 1650000000, marketCap: 15000000000, category: 'meme', sparkline: [0.0000242, 0.0000248, 0.000025, 0.0000252, 0.0000254], precision: 8, fundingRate: 0.0085, nextFundingIn: '03:45:12', openInterest: 220000000 },
  { id: 'fet', symbol: 'FET/USDT', name: 'Artificial Superintelligence', price: 1.84, change24h: 21.50, high24h: 1.98, low24h: 1.48, volume24h: 2100000000, marketCap: 4600000000, category: 'ai', sparkline: [1.48, 1.58, 1.68, 1.72, 1.80, 1.84], precision: 3, fundingRate: 0.0280, nextFundingIn: '03:45:12', openInterest: 290000000 },
  { id: 'wif', symbol: 'WIF/USDT', name: 'dogwifhat', price: 3.42, change24h: 11.20, high24h: 3.65, low24h: 3.02, volume24h: 1420000000, marketCap: 3400000000, category: 'meme', sparkline: [3.02, 3.15, 3.28, 3.35, 3.42], precision: 3, fundingRate: 0.0190, nextFundingIn: '03:45:12', openInterest: 190000000 },
  { id: 'apt', symbol: 'APT/USDT', name: 'Aptos', price: 12.80, change24h: 7.40, high24h: 13.20, low24h: 11.80, volume24h: 890000000, marketCap: 6500000000, category: 'layer1', sparkline: [11.8, 12.1, 12.4, 12.6, 12.8], precision: 2, fundingRate: 0.0110, nextFundingIn: '03:45:12', openInterest: 180000000 },
  { id: 'inj', symbol: 'INJ/USDT', name: 'Injective', price: 26.50, change24h: 8.90, high24h: 27.80, low24h: 24.10, volume24h: 680000000, marketCap: 2600000000, category: 'defi', sparkline: [24.1, 24.8, 25.4, 26.0, 26.5], precision: 2, fundingRate: 0.0120, nextFundingIn: '03:45:12', openInterest: 150000000 },
  { id: 'kas', symbol: 'KAS/USDT', name: 'Kaspa', price: 0.168, change24h: 3.40, high24h: 0.174, low24h: 0.160, volume24h: 340000000, marketCap: 4200000000, category: 'layer1', sparkline: [0.16, 0.163, 0.165, 0.168], precision: 4, fundingRate: 0.0080, nextFundingIn: '03:45:12', openInterest: 85000000 },
  { id: 'aave', symbol: 'AAVE/USDT', name: 'Aave', price: 215.00, change24h: 10.50, high24h: 224.00, low24h: 192.00, volume24h: 760000000, marketCap: 3200000000, category: 'defi', sparkline: [192, 198, 205, 210, 215], precision: 2, fundingRate: 0.0140, nextFundingIn: '03:45:12', openInterest: 120000000 },
  { id: 'uni', symbol: 'UNI/USDT', name: 'Uniswap', price: 11.40, change24h: 5.60, high24h: 11.90, low24h: 10.70, volume24h: 620000000, marketCap: 6800000000, category: 'defi', sparkline: [10.7, 10.9, 11.1, 11.3, 11.4], precision: 2, fundingRate: 0.0100, nextFundingIn: '03:45:12', openInterest: 110000000 },
  { id: 'floki', symbol: 'FLOKI/USDT', name: 'FLOKI', price: 0.000215, change24h: 15.80, high24h: 0.000230, low24h: 0.000182, volume24h: 920000000, marketCap: 2100000000, category: 'meme', sparkline: [0.000182, 0.000195, 0.000208, 0.000215], precision: 6, fundingRate: 0.0220, nextFundingIn: '03:45:12', openInterest: 140000000 },
  { id: 'tia', symbol: 'TIA/USDT', name: 'Celestia', price: 6.45, change24h: -2.30, high24h: 6.80, low24h: 6.30, volume24h: 420000000, marketCap: 1400000000, category: 'layer1', sparkline: [6.7, 6.8, 6.6, 6.5, 6.45], precision: 3, fundingRate: 0.0050, nextFundingIn: '03:45:12', openInterest: 95000000 },
  { id: 'stx', symbol: 'STX/USDT', name: 'Stacks', price: 2.12, change24h: 4.80, high24h: 2.22, low24h: 2.01, volume24h: 310000000, marketCap: 3100000000, category: 'spot', sparkline: [2.01, 2.05, 2.09, 2.12], precision: 3, fundingRate: 0.0090, nextFundingIn: '03:45:12', openInterest: 78000000 },
  { id: 'bonk', symbol: 'BONK/USDT', name: 'Bonk', price: 0.0000342, change24h: 18.20, high24h: 0.0000368, low24h: 0.0000285, volume24h: 1100000000, marketCap: 2400000000, category: 'meme', sparkline: [0.0000285, 0.0000310, 0.0000330, 0.0000342], precision: 8, fundingRate: 0.0250, nextFundingIn: '03:45:12', openInterest: 160000000 }
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
    message: 'Welcome to Oriviant! You have received $100,000 USDT in Demo Trading funds.',
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
    summary: 'How to utilize your $100,000 Oriviant Demo Balance to test strategies before live execution.',
    category: 'Guide',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400',
    content: [
      'Demo mode on Oriviant provides a 1:1 real-time market simulator matching live orderbooks.',
      'Treat your virtual $100k balance like real capital. Set position sizing to 1-2% per trade setup to practice real psychological discipline.',
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
  { symbol: 'USDT', name: 'Tether USD', icon: '₮', total: 100000.00, available: 94250.00, inOrder: 5750.00, valueUsdt: 100000.00, change24h: 0.00 },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', total: 0.45, available: 0.45, inOrder: 0.00, valueUsdt: 41602.86, change24h: 3.82 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', total: 4.20, available: 3.80, inOrder: 0.40, valueUsdt: 14617.05, change24h: 5.14 },
  { symbol: 'SOL', name: 'Solana', icon: 'S', total: 35.00, available: 35.00, inOrder: 0.00, valueUsdt: 7511.00, change24h: 8.75 }
];
