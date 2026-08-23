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
  manualRefreshFeed: () => void;
  refreshLiveOrders: () => Promise<void>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = useDemoMode();
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTC/USDT');
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
      const dbRes = await apiClient<any>('/admin/markets');
      let liveAssets = Array.isArray(dbRes) ? dbRes : (dbRes.data || []);
      
      const priceRes = await apiClient<any>('/markets/prices');
      const priceDict = priceRes.data || {};

      if (liveAssets.length > 0) {
        const dynamicCoins: CryptoCoin[] = liveAssets.filter((a: any) => a.status === 'Active').map((asset: any) => {
          const match = priceDict[asset.symbol] || priceDict[asset.symbol.replace('/', '-')];
          const price = match ? Number(match.price) : 0;
          return {
            id: asset.id.toString(),
            name: asset.name,
            symbol: asset.symbol,
            price: price,
            change24h: match ? Number(match.change24h) : 0,
            volume24h: match ? Number(match.volume24h) : 0,
            high24h: price * 1.05,
            low24h: price * 0.95,
            marketCap: 0,
            sparkline: Array(20).fill(price),
            precision: asset.price_precision || 2,
            category: asset.category.toLowerCase()
          };
        });

        setCoins(dynamicCoins);
        if (!dynamicCoins.find(c => c.symbol === activeSymbol) && dynamicCoins.length > 0) {
          setActiveSymbol(dynamicCoins[0].symbol);
        }
      }
    } catch (err) {
      console.error('Failed to load real market data:', err);
    }
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
        return { ...coin, price: newPrice, change24h: data.change24h || coin.change24h, sparkline: [...coin.sparkline.slice(1), newPrice] };
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
    // Fallback to 92450.80 if price is 0 or uninitialized
    const basePrice = (activeCoin?.price && activeCoin.price > 0) ? activeCoin.price : 92450.80;
    const prec = activeCoin?.precision || 2;

    const generateBook = () => {
      const spreadStep = basePrice * 0.0003; // Scale dynamically with coin price

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

  const setActiveCoinSymbol = (symbol: string) => setActiveSymbol(symbol);
  const toggleFavorite = (symbol: string) => setFavorites((prev) => prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]);
  const toggleCategoryFeed = (cat: keyof MarketCategoryConfig) => setCategoryConfig((prev) => ({ ...prev, [cat]: !prev[cat] }));
  const manualRefreshFeed = () => fetchMarketPrices();

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