export type ThemeMode = 'dark' | 'light';

export type NavigationTab = 
  | 'home'
  | 'markets'
  | 'spot'
  | 'futures'
  | 'assets'
  | 'copy-trading'
  | 'demo-workspace'
  | 'academy'
  | 'referral'
  | 'help'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'reviews';

export type OrderType = 'market' | 'limit' | 'stop';
export type OrderSide = 'buy' | 'sell';
export type MarginMode = 'cross' | 'isolated';
export type PositionSide = 'long' | 'short';

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  category: 'spot' | 'futures' | 'layer1' | 'defi' | 'meme' | 'ai' | 'trending';
  sparkline: number[];
  precision: number;
  fundingRate?: number;
  nextFundingIn?: string;
  openInterest?: number;
}

export interface OrderBookRow {
  price: number;
  size: number;
  total: number;
  depthPercent: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: OrderSide;
}

export interface ActiveOrder {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  total: number;
  timestamp: string;
  status: 'open' | 'filled' | 'canceled';
  isDemo?: boolean;
}

export interface FuturesPosition {
  id: string;
  pair: string;
  side: PositionSide;
  leverage: number;
  marginMode: MarginMode;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  size: number;
  margin: number;
  pnl: number;
  roe: number;
  tpPrice?: number;
  slPrice?: number;
  isDemo?: boolean;
}

export interface TraderReview {
  id: string;
  traderId: string;
  copierName: string;
  avatar: string;
  rating: number;
  comment: string;
  roi: number;
  date: string;
  helpfulCount: number;
  verifiedCopier: boolean;
  status?: 'approved' | 'pending' | 'flagged';
}

export interface LeadTrader {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  badges: string[];
  winRate: number;
  roi7d: number;
  roi30d: number;
  aum: number; // Assets under copy in USDT
  followers: number;
  maxFollowers: number;
  riskScore: number; // 1 - 10
  description: string;
  totalTrades: number;
  profitableTrades: number;
  performanceChart: number[];
  reviews: TraderReview[];
  status?: 'active' | 'pending_approval' | 'suspended';
}

export interface VirtualLedgerEntry {
  id: string;
  timestamp: string;
  type: 'refill' | 'trade_profit' | 'trade_loss' | 'fee' | 'copy_pnl';
  amount: number;
  description: string;
  balanceAfter: number;
}

export interface DemoAnalytics {
  totalRefills: number;
  totalTradesCount: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  lossRate: number;
  avgProfit: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  riskRewardRatio: number;
  currentStreak: number;
  longestWinStreak: number;
  bestTradePnL: number;
}

export interface WalletAsset {
  symbol: string;
  name: string;
  icon: string;
  total: number;
  available: number;
  inOrder: number;
  valueUsdt: number;
  change24h: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'alert' | 'execution' | 'copy' | 'system' | 'promotion';
  read: boolean;
  linkTab?: NavigationTab;
}

export interface AcademyArticle {
  id: string;
  title: string;
  summary: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Guide';
  readTime: string;
  image: string;
  content: string[];
  keyTakeaways: string[];
}

export interface GlobalSearchResult {
  coins: CryptoCoin[];
  traders: LeadTrader[];
  articles: AcademyArticle[];
}
