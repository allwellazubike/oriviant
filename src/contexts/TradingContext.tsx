import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoCoin, ActiveOrder, FuturesPosition, OrderSide, OrderType, PositionSide, MarginMode, RecentTrade, OrderBookRow } from '../types';
import { useDemoMode } from './DemoModeContext';
import { tradingApi } from '../api/trading';
import { futuresApi } from '../api/futures';
import { apiClient } from '../api/client';
import { socketService } from '../services/socketService';

export interface MarketFeedStatus {
  status: 'connected' | 'reconnecting' | 'delayed' | 'offline';
  latencyMs: number;
  lastUpdated: string;
  activeFeedsCount: number;
  isWsConnected: boolean;
  totalTicksReceived: number;
}

export interface MarketCategoryConfig {
  crypto: boolean; forex: boolean; stocks: boolean; etfs: boolean;
  indices: boolean; commodities: boolean; metals: boolean; energy: boolean; bonds: boolean;
}

interface TradingContextType {
  coins: CryptoCoin[];
  activeCoin: CryptoCoin | null;
  setActiveCoinSymbol: (symbol: string) => void;
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  priceFlashes: Record<string, 'up' | 'down' | null>;
  openOrders: ActiveOrder[];
  orderHistory: ActiveOrder[];
  allOpenOrders: ActiveOrder[];
  allOrderHistory: ActiveOrder[];
  placeOrder: (order: { pair: string; side: OrderSide; type: OrderType; price: number; amount: number; }) => Promise<{ success: boolean; message: string }>;
  cancelOrder: (orderId: string) => Promise<void>;
  positions: FuturesPosition[];
  allPositions: FuturesPosition[];
  openFuturesPosition: (pos: { pair: string; side: PositionSide; leverage: number; marginMode: MarginMode; amountUsdt: number; tpPrice?: number; slPrice?: number; }) => Promise<{ success: boolean; message: string }>;
  closePosition: (positionId: string) => Promise<void>;
  reversePosition: (positionId: string) => Promise<void>;
  orderBookBids: OrderBookRow[];
  orderBookAsks: OrderBookRow[];
  recentTrades: RecentTrade[];
  feedStatus: MarketFeedStatus;
  categoryConfig: MarketCategoryConfig;
  toggleCategoryFeed: (category: keyof MarketCategoryConfig) => void;
  manualRefreshFeed: () => Promise<void>; // 🔥 FIX: Updated to Promise
  refreshLiveOrders: () => Promise<void>;
}

// ----------------------------------------------------------------------
// FALLBACK MARKETS: Restores all Client-Requested Pairs Across the Platform
// ----------------------------------------------------------------------
const DEFAULT_MARKETS = [
  // Forex
  { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', price_precision: 4, fallback_price: 1.1648 },
  { id: 'usdjpy', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', price_precision: 3, fallback_price: 158.53 },
  { id: 'gbpusd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', price_precision: 4, fallback_price: 1.3596 },
  { id: 'gbpjpy', symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'forex', price_precision: 3, fallback_price: 200.27 },
  { id: 'audusd', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex', price_precision: 4, fallback_price: 0.7106 },
  { id: 'usdcad', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', price_precision: 4, fallback_price: 1.3828 },
  { id: 'eurjpy', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'forex', price_precision: 3, fallback_price: 167.31 },
  { id: 'usdchf', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', price_precision: 4, fallback_price: 0.8034 },
  { id: 'eurgbp', symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'forex', price_precision: 4, fallback_price: 0.8357 },
  { id: 'nzdusd', symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'forex', price_precision: 4, fallback_price: 0.5921 },
  { id: 'audjpy', symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'forex', price_precision: 3, fallback_price: 101.45 },

  // Indices
  { id: 'nas100', symbol: 'NAS100', name: 'NASDAQ-100 Index', category: 'indices', price_precision: 2, fallback_price: 20449.29 },
  { id: 'us500', symbol: 'US500', name: 'S&P 500 Index', category: 'indices', price_precision: 2, fallback_price: 5870.40 },
  { id: 'us30', symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'indices', price_precision: 2, fallback_price: 42888.03 },
  { id: 'jp225', symbol: 'JP225', name: 'Nikkei 225 Index', category: 'indices', price_precision: 2, fallback_price: 38893.77 },
  { id: 'hk50', symbol: 'HK50', name: 'Hang Seng Index', category: 'indices', price_precision: 2, fallback_price: 20670.40 },
  { id: 'ger40', symbol: 'GER40', name: 'DAX 40 Index', category: 'indices', price_precision: 2, fallback_price: 19477.11 },
  { id: 'uk100', symbol: 'UK100', name: 'FTSE 100 Index', category: 'indices', price_precision: 2, fallback_price: 8252.92 },
  { id: 'fra40', symbol: 'FRA40', name: 'CAC 40 Index', category: 'indices', price_precision: 2, fallback_price: 7515.07 },

  // Commodities & Metals & Energy
  { id: 'xauusd', symbol: 'XAU/USD', name: 'Gold Spot', category: 'metals', price_precision: 2, fallback_price: 2747.33 },
  { id: 'xagusd', symbol: 'XAG/USD', name: 'Silver Spot', category: 'metals', price_precision: 2, fallback_price: 31.76 },
  { id: 'xptusd', symbol: 'XPT/USD', name: 'Platinum Spot', category: 'metals', price_precision: 2, fallback_price: 985.83 },
  { id: 'xpdusd', symbol: 'XPD/USD', name: 'Palladium Spot', category: 'metals', price_precision: 2, fallback_price: 1047.73 },
  { id: 'copper', symbol: 'COPPER', name: 'High Grade Copper', category: 'metals', price_precision: 2, fallback_price: 4.35 },
  { id: 'wti', symbol: 'WTI', name: 'WTI Crude Oil', category: 'energy', price_precision: 2, fallback_price: 71.33 },
  { id: 'natgas', symbol: 'NATGAS', name: 'Natural Gas', category: 'energy', price_precision: 3, fallback_price: 2.85 },
  { id: 'hoil', symbol: 'HOIL', name: 'Heating Oil', category: 'energy', price_precision: 2, fallback_price: 2.25 },
  { id: 'gasoline', symbol: 'GASOLINE', name: 'RBOB Gasoline', category: 'energy', price_precision: 2, fallback_price: 2.12 },
  { id: 'soybean', symbol: 'SOYBEAN', name: 'Soybeans Futures', category: 'commodities', price_precision: 2, fallback_price: 995.14 },
  { id: 'wheat', symbol: 'WHEAT', name: 'Wheat Futures', category: 'commodities', price_precision: 2, fallback_price: 572.31 },
  { id: 'corn', symbol: 'CORN', name: 'Corn Futures', category: 'commodities', price_precision: 2, fallback_price: 418.44 },

  // Stocks & ETFs
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'stocks', price_precision: 2, fallback_price: 138.79 },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', price_precision: 2, fallback_price: 254.15 },
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', price_precision: 2, fallback_price: 232.58 },
  { id: 'meta', symbol: 'META', name: 'Meta Platforms Inc.', category: 'stocks', price_precision: 2, fallback_price: 585.98 },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', price_precision: 2, fallback_price: 187.82 },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stocks', price_precision: 2, fallback_price: 427.77 },
  { id: 'amd', symbol: 'AMD', name: 'Advanced Micro Devices', category: 'stocks', price_precision: 2, fallback_price: 156.41 },
  { id: 'googl', symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', price_precision: 2, fallback_price: 168.04 },
  { id: 'nflx', symbol: 'NFLX', name: 'Netflix Inc.', category: 'stocks', price_precision: 2, fallback_price: 713.59 },
  { id: 'jpm', symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'stocks', price_precision: 2, fallback_price: 222.80 },
  { id: 'intc', symbol: 'INTC', name: 'Intel Corp.', category: 'stocks', price_precision: 2, fallback_price: 22.71 },
  { id: 'orcl', symbol: 'ORCL', name: 'Oracle Corp.', category: 'stocks', price_precision: 2, fallback_price: 172.95 },
  { id: 'crm', symbol: 'CRM', name: 'Salesforce Inc.', category: 'stocks', price_precision: 2, fallback_price: 288.99 },
  { id: 'wmt', symbol: 'WMT', name: 'Walmart Inc.', category: 'stocks', price_precision: 2, fallback_price: 82.55 },
  { id: 'v', symbol: 'V', name: 'Visa Inc.', category: 'stocks', price_precision: 2, fallback_price: 292.94 },
  { id: 'dis', symbol: 'DIS', name: 'Walt Disney Co.', category: 'stocks', price_precision: 2, fallback_price: 96.63 },
  { id: 'ma', symbol: 'MA', name: 'Mastercard Inc.', category: 'stocks', price_precision: 2, fallback_price: 504.48 },
  { id: 'gs', symbol: 'GS', name: 'Goldman Sachs Group', category: 'stocks', price_precision: 2, fallback_price: 526.88 },
  { id: 'mcd', symbol: 'MCD', name: 'McDonald\'s Corp.', category: 'stocks', price_precision: 2, fallback_price: 296.80 },
  { id: 'jnj', symbol: 'JNJ', name: 'Johnson & Johnson', category: 'stocks', price_precision: 2, fallback_price: 161.47 },
  { id: 'ko', symbol: 'KO', name: 'Coca-Cola Co.', category: 'stocks', price_precision: 2, fallback_price: 68.59 },
  { id: 'spy', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'etfs', price_precision: 2, fallback_price: 582.99 },
  { id: 'qqq', symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'etfs', price_precision: 2, fallback_price: 494.50 },
  { id: 'voo', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'etfs', price_precision: 2, fallback_price: 535.88 },
  { id: 'iwm', symbol: 'IWM', name: 'iShares Russell 2000 ETF', category: 'etfs', price_precision: 2, fallback_price: 222.92 },
  { id: 'vti', symbol: 'VTI', name: 'Vanguard Total Stock Market', category: 'etfs', price_precision: 2, fallback_price: 283.35 },
  { id: 'xlk', symbol: 'XLK', name: 'Technology Select Sector SPDR', category: 'etfs', price_precision: 2, fallback_price: 232.27 },
  { id: 'xlf', symbol: 'XLF', name: 'Financial Select Sector SPDR', category: 'etfs', price_precision: 2, fallback_price: 46.82 },
  { id: 'xle', symbol: 'XLE', name: 'Energy Select Sector SPDR', category: 'etfs', price_precision: 2, fallback_price: 91.24 },
  { id: 'dia', symbol: 'DIA', name: 'SPDR Dow Jones Industrial ETF', category: 'etfs', price_precision: 2, fallback_price: 428.92 },
  { id: 'arkk', symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'etfs', price_precision: 2, fallback_price: 52.46 },

  // Bonds
  { id: 'us10y', symbol: 'US10Y', name: 'US Treasury 10Y Yield', category: 'bonds', price_precision: 2, fallback_price: 4.22 },
  { id: 'us30y', symbol: 'US30Y', name: 'US Treasury 30Y Bond', category: 'bonds', price_precision: 2, fallback_price: 4.48 },
  { id: 'bund', symbol: 'BUND', name: 'German 10Y Bund Yield', category: 'bonds', price_precision: 2, fallback_price: 2.28 },

  // Cryptos (In case they aren't in DB yet)
  { id: 'btcusdt', symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', price_precision: 2, fallback_price: 92512.39 },
  { id: 'ethusdt', symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', price_precision: 2, fallback_price: 3472.61 },
  { id: 'solusdt', symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', price_precision: 2, fallback_price: 215.58 },
  { id: 'xrpusdt', symbol: 'XRP/USDT', name: 'Ripple', category: 'crypto', price_precision: 4, fallback_price: 2.4573 },
  { id: 'dogeusdt', symbol: 'DOGE/USDT', name: 'Dogecoin', category: 'crypto', price_precision: 5, fallback_price: 0.3818 },
  { id: 'suiusdt', symbol: 'SUI/USDT', name: 'Sui Network', category: 'crypto', price_precision: 4, fallback_price: 3.6913 },
  { id: 'pepeusdt', symbol: 'PEPE/USDT', name: 'Pepe Coin', category: 'crypto', price_precision: 8, fallback_price: 0.00002162 },
  { id: 'bnbusdt', symbol: 'BNB/USDT', name: 'BNB', category: 'crypto', price_precision: 2, fallback_price: 685.18 }
].map(m => ({ ...m, status: 'Active' }));
// ----------------------------------------------------------------------

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = useDemoMode();
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  
  const [activeSymbol, setActiveSymbol] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oriviant_active_coin') || 'BTC/USDT';
    }
    return 'BTC/USDT';
  });

  const setActiveCoinSymbol = (symbol: string) => {
    setActiveSymbol(symbol);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oriviant_active_coin', symbol);
    }
  };

  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down' | null>>({});

  const [categoryConfig, setCategoryConfig] = useState<MarketCategoryConfig>({
    crypto: true, forex: true, stocks: true, etfs: true, indices: true, commodities: true, metals: true, energy: true, bonds: true,
  });

  const [feedStatus, setFeedStatus] = useState<MarketFeedStatus>({
    status: 'connected', latencyMs: 18, lastUpdated: new Date().toLocaleTimeString(), activeFeedsCount: 0, isWsConnected: true, totalTicksReceived: 0
  });

  const [rawOpenOrders, setRawOpenOrders] = useState<ActiveOrder[]>([]);
  const [rawOrderHistory, setRawOrderHistory] = useState<ActiveOrder[]>([]);
  const [rawPositions, setRawPositions] = useState<FuturesPosition[]>([]);

  const [orderBookBids, setOrderBookBids] = useState<OrderBookRow[]>([]);
  const [orderBookAsks, setOrderBookAsks] = useState<OrderBookRow[]>([]);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);

  const activeCoin = coins.find((c) => c.symbol === activeSymbol) || coins[0] || null;

  const triggerFlash = (symbol: string, direction: 'up' | 'down') => {
    setPriceFlashes((flashes) => ({ ...flashes, [symbol]: direction }));
    setTimeout(() => { setPriceFlashes((flashes) => ({ ...flashes, [symbol]: null })); }, 600);
  };

  const fetchMarketPrices = async () => {
    try {
      const dbRes = await apiClient<any>('/admin/markets').catch(() => ({ data: [] }));
      let liveAssets = Array.isArray(dbRes) ? dbRes : (dbRes.data || []);
      
      const existingSymbols = new Set(liveAssets.map((a: any) => a.symbol));
      const mergedAssets = [...liveAssets];
      
      DEFAULT_MARKETS.forEach(fallback => {
        if (!existingSymbols.has(fallback.symbol)) {
          mergedAssets.push(fallback);
        }
      });

      const priceRes = await apiClient<any>('/markets/prices').catch(() => ({ data: {} }));
      const priceDict = priceRes.data || {};

      if (mergedAssets.length > 0) {
        const dynamicCoins: CryptoCoin[] = mergedAssets.filter((a: any) => a.status === 'Active').map((asset: any) => {
          const match = priceDict[asset.symbol] || priceDict[asset.symbol.replace('/', '-')];
          const price = match ? Number(match.price) : (asset.fallback_price || 100);
          const change = match ? Number(match.change24h) : parseFloat((Math.random() * 3 - 1.5).toFixed(2));
          const hasRealVolume = match && match.volume24h !== undefined && match.volume24h !== null;
          const hasRealSparkline = Array.isArray(match?.sparkline) && match.sparkline.length > 1;

          return {
            id: asset.id.toString(),
            name: asset.name,
            symbol: asset.symbol,
            price: price,
            change24h: change,
            volume24h: hasRealVolume ? Number(match.volume24h) : Math.random() * 50000000 + 20000000,
            high24h: match ? Number(match.high24h) : price * 1.05,
            low24h: match ? Number(match.low24h) : price * 0.95,
            marketCap: 0,
            sparkline: hasRealSparkline
              ? match.sparkline.map(Number)
              : Array(20).fill(price).map(p => p + (Math.random() * p * 0.002 - p * 0.001)),
            precision: asset.price_precision || 2,
            category: asset.category.toLowerCase()
          };
        });

        setCoins(dynamicCoins);
        if (!dynamicCoins.find(c => c.symbol === activeSymbol) && dynamicCoins.length > 0) {
          const defaultCoin = dynamicCoins[0].symbol;
          setActiveCoinSymbol(defaultCoin);
        }
      }
    } catch (err) {
      console.error('Failed to load real market data:', err);
    }
  };

  // 🔥 FIX: Added async/await and clock updates to sync manual feed properly
  const manualRefreshFeed = async () => {
    await fetchMarketPrices();
    setFeedStatus(prev => ({
      ...prev,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  };

  const fetchUserTradingData = async () => {
    const token = localStorage.getItem('oriviant_token');
    if (!token || isDemoMode) return;
    try {
      const [posRes, ordRes, histRes] = await Promise.all([
        futuresApi.getPositions().catch(() => ({ success: false, data: [] })),
        tradingApi.getOpenOrders().catch(() => ({ success: false, data: [] })),
        tradingApi.getTradeHistory().catch(() => ({ success: false, data: [] }))
      ]);

      if (posRes.success && Array.isArray(posRes.data)) {
        setRawPositions(posRes.data.map((p: any) => ({
          id: p.id.toString(), pair: p.market_symbol, side: p.side.toLowerCase() as PositionSide,
          leverage: Number(p.leverage), marginMode: p.margin_mode.toLowerCase() as MarginMode,
          entryPrice: Number(p.entry_price), markPrice: Number(p.entry_price),
          liquidationPrice: Number(p.liquidation_price), size: Number(p.size),
          margin: Number(p.margin), pnl: 0, roe: 0, isDemo: false
        })));
      }

      if (ordRes.success && Array.isArray(ordRes.data)) {
        setRawOpenOrders(ordRes.data.map((o: any) => ({
          id: o.id.toString(), pair: o.pair, side: o.side.toLowerCase() as OrderSide, type: o.type.toLowerCase() as OrderType,
          price: Number(o.limit_price || o.fill_price), amount: Number(o.amount),
          filled: o.status === 'FILLED' ? Number(o.amount) : 0, total: Number(o.amount) * Number(o.limit_price || o.fill_price),
          timestamp: new Date(o.created_at).toISOString(), status: o.status.toLowerCase(), isDemo: false
        })));
      }

      if (histRes.success && Array.isArray(histRes.data)) {
        setRawOrderHistory(histRes.data.map((o: any) => ({
          id: o.id.toString(), pair: o.pair, side: o.side.toLowerCase() as OrderSide, type: o.type.toLowerCase() as OrderType,
          price: Number(o.limit_price || o.fill_price), amount: Number(o.amount),
          filled: o.status === 'FILLED' ? Number(o.amount) : 0, total: Number(o.amount) * Number(o.limit_price || o.fill_price),
          timestamp: new Date(o.created_at).toISOString(), status: o.status.toLowerCase(), isDemo: false
        })));
      }
    } catch (err) {
      console.error('Failed to sync trading data:', err);
    }
  };

  useEffect(() => {
    fetchMarketPrices();
    fetchUserTradingData();
  }, [isDemoMode]);

  useEffect(() => {
    socketService.connect();
    coins.forEach(coin => socketService.subscribeToMarket(coin.symbol));

    const handleTick = (data: any) => {
      if (!data || !data.symbol || !data.price) return;
      setCoins((prevCoins) => prevCoins.map((coin) => {
        if (coin.symbol !== data.symbol) return coin;
        const newPrice = parseFloat(data.price);
        if (Math.abs(newPrice - coin.price) > 0.000001) triggerFlash(coin.symbol, newPrice > coin.price ? 'up' : 'down');
        return {
          ...coin,
          price: newPrice,
          change24h: data.change24h ?? coin.change24h,
          volume24h: data.volume24h !== undefined && data.volume24h !== null ? Number(data.volume24h) : coin.volume24h,
          high24h: data.high24h !== undefined ? Number(data.high24h) : coin.high24h,
          low24h: data.low24h !== undefined ? Number(data.low24h) : coin.low24h,
          sparkline: [...coin.sparkline.slice(1), newPrice]
        };
      }));
    };

    socketService.socket?.on('market_tick', handleTick);

    return () => {
      coins.forEach(coin => socketService.unsubscribeFromMarket(coin.symbol));
      socketService.socket?.off('market_tick', handleTick);
    };
  }, [coins.length, activeSymbol]);

  useEffect(() => {
    setRawPositions((prev) => prev.map((pos) => {
      const coin = coins.find((c) => c.symbol === pos.pair);
      if (!coin) return pos;
      const markPrice = coin.price;
      let priceDiff = pos.side === 'long' ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
      const pnl = parseFloat((priceDiff * pos.size).toFixed(2));
      const roe = parseFloat(((pnl / pos.margin) * 100).toFixed(1));
      return { ...pos, markPrice, pnl, roe };
    }));
  }, [coins]);

  // Simulated live animated Order Book
  useEffect(() => {
    const basePrice = (activeCoin?.price && activeCoin.price > 0) ? activeCoin.price : 92450.80;
    const prec = activeCoin?.precision || 2;

    const generateBook = () => {
      const spreadStep = basePrice * 0.0003; 

      const newAsks = Array.from({ length: 8 }).map((_, i) => {
        const price = parseFloat((basePrice + ((8 - i) * spreadStep) + (Math.random() * spreadStep * 0.5)).toFixed(prec));
        const size = parseFloat((Math.random() * 2 + 0.01).toFixed(3));
        return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (8 - i) * 12)) };
      });

      const newBids = Array.from({ length: 8 }).map((_, i) => {
        const price = parseFloat((Math.max(0.01, basePrice - ((i + 1) * spreadStep) - (Math.random() * spreadStep * 0.5))).toFixed(prec));
        const size = parseFloat((Math.random() * 2 + 0.01).toFixed(3));
        return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (i + 1) * 12)) };
      });

      setOrderBookAsks(newAsks);
      setOrderBookBids(newBids);
    };

    generateBook();
    const interval = setInterval(generateBook, 2000);
    return () => clearInterval(interval);
  }, [activeCoin?.price, activeCoin?.precision]);

  const toggleFavorite = (symbol: string) => setFavorites((prev) => prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]);
  const toggleCategoryFeed = (cat: keyof MarketCategoryConfig) => setCategoryConfig((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const placeOrder = async (order: any) => {
    if (isDemoMode) return { success: true, message: 'Demo Order Executed' };
    try {
      const res = await tradingApi.placeOrder({
        market_symbol: order.pair, side: order.side.toUpperCase(), type: order.type.toUpperCase(),
        amount: order.amount, price: order.price
      });
      await fetchUserTradingData();
      window.dispatchEvent(new Event('oriviant_refresh_wallets'));
      return { success: true, message: res.message || 'Order placed successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Order rejected.' };
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (isDemoMode) return;
    try {
      await tradingApi.cancelOrder(orderId);
      await fetchUserTradingData();
      window.dispatchEvent(new Event('oriviant_refresh_wallets'));
    } catch (err) { console.error(err); }
  };

  const openFuturesPosition = async (pos: any) => {
    if (isDemoMode) return { success: true, message: 'Demo Position Opened' };
    try {
      const res = await futuresApi.openPosition({
        market_symbol: pos.pair, side: pos.side.toUpperCase(), margin_mode: pos.marginMode.toUpperCase(),
        leverage: pos.leverage, collateral_amount: pos.amountUsdt
      });
      await fetchUserTradingData();
      window.dispatchEvent(new Event('oriviant_refresh_wallets'));
      return { success: true, message: res.message || 'Position opened.' };
    } catch (err: any) { return { success: false, message: err.message || 'Failed to open position.' }; }
  };

  const closePosition = async (positionId: string) => {
    if (isDemoMode) return;
    try {
      await futuresApi.closePosition(positionId);
      await fetchUserTradingData();
      window.dispatchEvent(new Event('oriviant_refresh_wallets'));
    } catch (err) { console.error(err); }
  };

  const reversePosition = async (positionId: string) => {
    const targetPos = rawPositions.find((p) => p.id === positionId);
    if (!targetPos) return;
    await closePosition(positionId);
    await openFuturesPosition({ pair: targetPos.pair, side: targetPos.side === 'long' ? 'short' : 'long', leverage: targetPos.leverage, marginMode: targetPos.marginMode, amountUsdt: targetPos.margin });
  };

  return (
    <TradingContext.Provider value={{
      coins, activeCoin, setActiveCoinSymbol, favorites, toggleFavorite, priceFlashes,
      openOrders: rawOpenOrders.filter((o) => !!o.isDemo === isDemoMode),
      orderHistory: rawOrderHistory.filter((o) => !!o.isDemo === isDemoMode),
      allOpenOrders: rawOpenOrders, allOrderHistory: rawOrderHistory,
      placeOrder, cancelOrder, positions: rawPositions.filter((p) => !!p.isDemo === isDemoMode),
      allPositions: rawPositions, openFuturesPosition, closePosition, reversePosition,
      orderBookBids, orderBookAsks, recentTrades, feedStatus, categoryConfig, toggleCategoryFeed, manualRefreshFeed,
      refreshLiveOrders: fetchUserTradingData
    }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
};