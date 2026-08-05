import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CryptoCoin, ActiveOrder, FuturesPosition, OrderSide, OrderType, PositionSide, MarginMode, RecentTrade, OrderBookRow } from '../types';
import { INITIAL_COINS } from '../mockData';
import { useDemoMode } from './DemoModeContext';

export interface MarketFeedStatus {
  status: 'connected' | 'reconnecting' | 'delayed' | 'offline';
  latencyMs: number;
  lastUpdated: string;
  activeFeedsCount: number;
  isWsConnected: boolean;
  totalTicksReceived: number;
}

export interface MarketCategoryConfig {
  crypto: boolean;
  forex: boolean;
  stocks: boolean;
  etfs: boolean;
  indices: boolean;
  commodities: boolean;
  metals: boolean;
  energy: boolean;
  bonds: boolean;
}

interface TradingContextType {
  coins: CryptoCoin[];
  activeCoin: CryptoCoin;
  setActiveCoinSymbol: (symbol: string) => void;
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  priceFlashes: Record<string, 'up' | 'down' | null>;
  openOrders: ActiveOrder[];
  orderHistory: ActiveOrder[];
  allOpenOrders: ActiveOrder[];
  allOrderHistory: ActiveOrder[];
  placeOrder: (order: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
  }) => { success: boolean; message: string };
  cancelOrder: (orderId: string) => void;
  positions: FuturesPosition[];
  allPositions: FuturesPosition[];
  openFuturesPosition: (pos: {
    pair: string;
    side: PositionSide;
    leverage: number;
    marginMode: MarginMode;
    amountUsdt: number;
    tpPrice?: number;
    slPrice?: number;
  }) => { success: boolean; message: string };
  closePosition: (positionId: string) => void;
  reversePosition: (positionId: string) => void;
  orderBookBids: OrderBookRow[];
  orderBookAsks: OrderBookRow[];
  recentTrades: RecentTrade[];
  
  // Real-Time Feed Controls & Metrics
  feedStatus: MarketFeedStatus;
  categoryConfig: MarketCategoryConfig;
  toggleCategoryFeed: (category: keyof MarketCategoryConfig) => void;
  manualRefreshFeed: () => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode, addLedgerEntry } = useDemoMode();
  const [coins, setCoins] = useState<CryptoCoin[]>(INITIAL_COINS);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTC/USDT');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down' | null>>({});

  // Market Category Toggles (Controlled via Admin)
  const [categoryConfig, setCategoryConfig] = useState<MarketCategoryConfig>({
    crypto: true,
    forex: true,
    stocks: true,
    etfs: true,
    indices: true,
    commodities: true,
    metals: true,
    energy: true,
    bonds: true,
  });

  // Feed Status
  const [feedStatus, setFeedStatus] = useState<MarketFeedStatus>({
    status: 'connected',
    latencyMs: 18,
    lastUpdated: new Date().toLocaleTimeString(),
    activeFeedsCount: INITIAL_COINS.length,
    isWsConnected: true,
    totalTicksReceived: 1420
  });

  const wsRef = useRef<WebSocket | null>(null);

  const [rawOpenOrders, setRawOpenOrders] = useState<ActiveOrder[]>([
    {
      id: 'ord-101',
      pair: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      price: 89500.00,
      amount: 0.1,
      filled: 0,
      total: 8950.00,
      timestamp: '2026-08-04 12:10:05',
      status: 'open',
      isDemo: true
    },
    {
      id: 'ord-102',
      pair: 'ETH/USDT',
      side: 'sell',
      type: 'limit',
      price: 3600.00,
      amount: 1.5,
      filled: 0,
      total: 5400.00,
      timestamp: '2026-08-04 11:45:22',
      status: 'open',
      isDemo: true
    },
    {
      id: 'ord-live-1',
      pair: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      price: 88000.00,
      amount: 0.05,
      filled: 0,
      total: 4400.00,
      timestamp: '2026-08-04 10:00:00',
      status: 'open',
      isDemo: false
    }
  ]);

  const [rawOrderHistory, setRawOrderHistory] = useState<ActiveOrder[]>([
    {
      id: 'ord-099',
      pair: 'SOL/USDT',
      side: 'buy',
      type: 'market',
      price: 202.50,
      amount: 10,
      filled: 10,
      total: 2025.00,
      timestamp: '2026-08-04 09:15:00',
      status: 'filled',
      isDemo: true
    },
    {
      id: 'ord-live-hist-1',
      pair: 'ETH/USDT',
      side: 'buy',
      type: 'market',
      price: 3450.00,
      amount: 1.0,
      filled: 1.0,
      total: 3450.00,
      timestamp: '2026-08-03 16:20:00',
      status: 'filled',
      isDemo: false
    }
  ]);

  const [rawPositions, setRawPositions] = useState<FuturesPosition[]>([
    {
      id: 'pos-1',
      pair: 'BTC/USDT',
      side: 'long',
      leverage: 20,
      marginMode: 'cross',
      entryPrice: 90200.00,
      markPrice: 92450.80,
      liquidationPrice: 85900.00,
      size: 1.5, // BTC
      margin: 6765.00,
      pnl: 3376.20,
      roe: 49.9,
      tpPrice: 96000,
      slPrice: 88000,
      isDemo: true
    },
    {
      id: 'pos-2',
      pair: 'SOL/USDT',
      side: 'short',
      leverage: 10,
      marginMode: 'isolated',
      entryPrice: 218.00,
      markPrice: 214.60,
      liquidationPrice: 239.80,
      size: 50, // SOL
      margin: 1090.00,
      pnl: 170.00,
      roe: 15.6,
      tpPrice: 200,
      slPrice: 225,
      isDemo: true
    },
    {
      id: 'pos-live-1',
      pair: 'ETH/USDT',
      side: 'long',
      leverage: 10,
      marginMode: 'cross',
      entryPrice: 3420.00,
      markPrice: 3510.00,
      liquidationPrice: 3100.00,
      size: 2.0,
      margin: 684.00,
      pnl: 180.00,
      roe: 26.3,
      tpPrice: 3800,
      slPrice: 3200,
      isDemo: false
    }
  ]);

  // Derived filtered arrays according to active account mode
  const openOrders = rawOpenOrders.filter((o) => !!o.isDemo === isDemoMode);
  const orderHistory = rawOrderHistory.filter((o) => !!o.isDemo === isDemoMode);
  const positions = rawPositions.filter((p) => !!p.isDemo === isDemoMode);

  // Active Coin helper
  const activeCoin = coins.find((c) => c.symbol === activeSymbol) || coins[0];

  // Helper to trigger price flash
  const triggerFlash = (symbol: string, direction: 'up' | 'down') => {
    setPriceFlashes((flashes) => ({ ...flashes, [symbol]: direction }));
    setTimeout(() => {
      setPriceFlashes((flashes) => ({ ...flashes, [symbol]: null }));
    }, 600);
  };

  // 1. Fetch Binance Live REST Tickers for Crypto Assets
  const fetchBinanceCryptoTickers = async () => {
    if (!categoryConfig.crypto) return;
    const startTime = performance.now();
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('Binance REST failed');
      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);

      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          if (coin.assetClass !== 'crypto' && coin.category !== 'crypto') return coin;

          const rawSymbol = coin.symbol.replace('/', '');
          const binanceMatch = data.find((d: any) => d.symbol === rawSymbol);
          if (!binanceMatch) return coin;

          const newPrice = parseFloat(binanceMatch.lastPrice);
          if (isNaN(newPrice) || newPrice <= 0) return coin;

          const oldPrice = coin.price;
          const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null;
          if (direction) triggerFlash(coin.symbol, direction);

          const change24h = parseFloat(parseFloat(binanceMatch.priceChangePercent).toFixed(2));
          const high24h = parseFloat(binanceMatch.highPrice);
          const low24h = parseFloat(binanceMatch.lowPrice);
          const volume24h = parseFloat(binanceMatch.quoteVolume) || coin.volume24h;

          // Update sparkline
          const sparkline = [...coin.sparkline.slice(1), newPrice];

          return {
            ...coin,
            price: newPrice,
            change24h,
            high24h,
            low24h,
            volume24h,
            sparkline
          };
        })
      );

      setFeedStatus((prev) => ({
        ...prev,
        status: 'connected',
        latencyMs: Math.max(8, latency),
        lastUpdated: new Date().toLocaleTimeString(),
        totalTicksReceived: prev.totalTicksReceived + 1
      }));
    } catch (err) {
      // Fallback silently if network fails
    }
  };

  // 2. Fetch Live Forex Rates
  const fetchForexRates = async () => {
    if (!categoryConfig.forex) return;
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) return;
      const data = await res.json();
      const rates = data?.rates;
      if (!rates) return;

      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          if (coin.assetClass !== 'forex' && coin.category !== 'forex') return coin;

          let newPrice = coin.price;
          if (coin.symbol === 'EUR/USD' && rates.EUR) newPrice = parseFloat((1 / rates.EUR).toFixed(4));
          if (coin.symbol === 'GBP/USD' && rates.GBP) newPrice = parseFloat((1 / rates.GBP).toFixed(4));
          if (coin.symbol === 'USD/JPY' && rates.JPY) newPrice = parseFloat((rates.JPY).toFixed(2));
          if (coin.symbol === 'USD/CHF' && rates.CHF) newPrice = parseFloat((rates.CHF).toFixed(4));
          if (coin.symbol === 'AUD/USD' && rates.AUD) newPrice = parseFloat((1 / rates.AUD).toFixed(4));
          if (coin.symbol === 'NZD/USD' && rates.NZD) newPrice = parseFloat((1 / rates.NZD).toFixed(4));
          if (coin.symbol === 'USD/CAD' && rates.CAD) newPrice = parseFloat((rates.CAD).toFixed(4));

          if (newPrice !== coin.price) {
            const direction = newPrice > coin.price ? 'up' : 'down';
            triggerFlash(coin.symbol, direction);
            return {
              ...coin,
              price: newPrice,
              sparkline: [...coin.sparkline.slice(1), newPrice]
            };
          }
          return coin;
        })
      );
    } catch {
      // Fallback
    }
  };

  // Connect WebSocket to Binance Streaming
  useEffect(() => {
    fetchBinanceCryptoTickers();
    fetchForexRates();

    // Setup Binance WebSocket Stream
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
      wsRef.current = ws;

      ws.onopen = () => {
        setFeedStatus((prev) => ({ ...prev, isWsConnected: true, status: 'connected' }));
      };

      ws.onmessage = (event) => {
        if (!categoryConfig.crypto) return;
        try {
          const rawData = JSON.parse(event.data);
          if (!Array.isArray(rawData)) return;

          setCoins((prevCoins) =>
            prevCoins.map((coin) => {
              if (coin.assetClass !== 'crypto' && coin.category !== 'crypto') return coin;
              const rawSym = coin.symbol.replace('/', '');
              const item = rawData.find((d: any) => d.s === rawSym);
              if (!item) return coin;

              const newPrice = parseFloat(item.c);
              if (isNaN(newPrice) || newPrice <= 0) return coin;

              const oldPrice = coin.price;
              if (Math.abs(newPrice - oldPrice) > 0.00000001) {
                const direction = newPrice > oldPrice ? 'up' : 'down';
                triggerFlash(coin.symbol, direction);
              }

              const change24h = parseFloat(parseFloat(item.P).toFixed(2));
              const high24h = parseFloat(item.h);
              const low24h = parseFloat(item.l);
              const volume24h = parseFloat(item.q) || coin.volume24h;

              return {
                ...coin,
                price: newPrice,
                change24h,
                high24h,
                low24h,
                volume24h,
                sparkline: [...coin.sparkline.slice(1), newPrice]
              };
            })
          );

          setFeedStatus((prev) => ({
            ...prev,
            lastUpdated: new Date().toLocaleTimeString(),
            totalTicksReceived: prev.totalTicksReceived + 1
          }));
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {
        setFeedStatus((prev) => ({ ...prev, isWsConnected: false, status: 'delayed' }));
      };

      ws.onclose = () => {
        setFeedStatus((prev) => ({ ...prev, isWsConnected: false }));
      };
    } catch {
      // WS error fallback
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Real-Time High-Frequency Micro-Tick Generator for All Enabled Asset Classes
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          const cat = (coin.assetClass || coin.category || 'crypto') as keyof MarketCategoryConfig;
          if (!categoryConfig[cat]) return coin;

          // 35% chance to tick this asset per interval
          if (Math.random() > 0.35) return coin;

          // Micro fluctuation calculation
          const volatility = cat === 'crypto' ? 0.0018 : cat === 'forex' ? 0.0003 : 0.0008;
          const changeFactor = (Math.random() - 0.49) * volatility;
          const oldPrice = coin.price;
          const newPrice = Math.max(0.000001, parseFloat((oldPrice * (1 + changeFactor)).toFixed(coin.precision)));
          const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null;

          if (direction) {
            triggerFlash(coin.symbol, direction);
          }

          const priceDiffPercent = ((newPrice - oldPrice) / oldPrice) * 100;
          const newChange24h = parseFloat((coin.change24h + priceDiffPercent * 0.05).toFixed(2));
          const newHigh = Math.max(coin.high24h, newPrice);
          const newLow = Math.min(coin.low24h, newPrice);
          const newSpark = [...coin.sparkline.slice(1), newPrice];

          return {
            ...coin,
            price: newPrice,
            change24h: newChange24h,
            high24h: newHigh,
            low24h: newLow,
            sparkline: newSpark
          };
        })
      );

      setFeedStatus((prev) => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString(),
        totalTicksReceived: prev.totalTicksReceived + 1
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [categoryConfig]);

  // Sync positions mark prices and PnL live
  useEffect(() => {
    setRawPositions((prevPositions) =>
      prevPositions.map((pos) => {
        const currentCoin = coins.find((c) => c.symbol === pos.pair);
        if (!currentCoin) return pos;

        const markPrice = currentCoin.price;
        let priceDiff = markPrice - pos.entryPrice;
        if (pos.side === 'short') priceDiff = pos.entryPrice - markPrice;

        const pnl = parseFloat((priceDiff * pos.size).toFixed(2));
        const roe = parseFloat(((pnl / pos.margin) * 100).toFixed(1));

        return {
          ...pos,
          markPrice,
          pnl,
          roe
        };
      })
    );
  }, [coins]);

  const setActiveCoinSymbol = (symbol: string) => {
    setActiveSymbol(symbol);
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const toggleCategoryFeed = (cat: keyof MarketCategoryConfig) => {
    setCategoryConfig((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const manualRefreshFeed = () => {
    fetchBinanceCryptoTickers();
    fetchForexRates();
  };

  const placeOrder = (order: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
  }) => {
    const total = order.price * order.amount;
    const newOrder: ActiveOrder = {
      id: `ord-${Date.now()}`,
      pair: order.pair,
      side: order.side,
      type: order.type,
      price: order.price,
      amount: order.amount,
      filled: order.type === 'market' ? order.amount : 0,
      total,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: order.type === 'market' ? 'filled' : 'open',
      isDemo: isDemoMode
    };

    if (order.type === 'market') {
      setRawOrderHistory((prev) => [newOrder, ...prev]);
      if (isDemoMode) {
        addLedgerEntry({
          type: 'trade_profit',
          amount: -0.0005 * total,
          description: `Market ${order.side.toUpperCase()} Order Fee (${order.pair})`
        });
      }
      return { success: true, message: `Market ${order.side.toUpperCase()} Order executed (${isDemoMode ? 'Demo' : 'Live'})!` };
    } else {
      setRawOpenOrders((prev) => [newOrder, ...prev]);
      return { success: true, message: `Limit ${order.side.toUpperCase()} Order placed (${isDemoMode ? 'Demo' : 'Live'}).` };
    }
  };

  const cancelOrder = (orderId: string) => {
    setRawOpenOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const openFuturesPosition = (pos: {
    pair: string;
    side: PositionSide;
    leverage: number;
    marginMode: MarginMode;
    amountUsdt: number;
    tpPrice?: number;
    slPrice?: number;
  }) => {
    const targetCoin = coins.find((c) => c.symbol === pos.pair) || activeCoin;
    const entryPrice = targetCoin.price;
    const size = (pos.amountUsdt * pos.leverage) / entryPrice;

    const liqFactor = (100 / pos.leverage) * 0.9;
    let liqPrice = entryPrice * (1 - liqFactor / 100);
    if (pos.side === 'short') {
      liqPrice = entryPrice * (1 + liqFactor / 100);
    }

    const newPosition: FuturesPosition = {
      id: `pos-${Date.now()}`,
      pair: pos.pair,
      side: pos.side,
      leverage: pos.leverage,
      marginMode: pos.marginMode,
      entryPrice,
      markPrice: entryPrice,
      liquidationPrice: parseFloat(liqPrice.toFixed(targetCoin.precision)),
      size: parseFloat(size.toFixed(4)),
      margin: pos.amountUsdt,
      pnl: 0,
      roe: 0,
      tpPrice: pos.tpPrice,
      slPrice: pos.slPrice,
      isDemo: isDemoMode
    };

    setRawPositions((prev) => [newPosition, ...prev]);
    return { success: true, message: `Opened ${pos.leverage}x ${pos.side.toUpperCase()} position on ${pos.pair} (${isDemoMode ? 'Demo' : 'Live'})` };
  };

  const closePosition = (positionId: string) => {
    const targetPos = rawPositions.find((p) => p.id === positionId);
    if (targetPos && targetPos.isDemo) {
      addLedgerEntry({
        type: targetPos.pnl >= 0 ? 'trade_profit' : 'trade_loss',
        amount: targetPos.pnl + targetPos.margin,
        description: `Closed ${targetPos.leverage}x ${targetPos.side.toUpperCase()} Position (${targetPos.pair}) PnL: ${targetPos.pnl >= 0 ? '+' : ''}${targetPos.pnl} USDT`
      });
    }
    setRawPositions((prev) => prev.filter((p) => p.id !== positionId));
  };

  const reversePosition = (positionId: string) => {
    setRawPositions((prev) =>
      prev.map((p) => {
        if (p.id !== positionId) return p;
        const newSide: PositionSide = p.side === 'long' ? 'short' : 'long';
        let liqPrice = p.entryPrice * 0.9;
        if (newSide === 'short') liqPrice = p.entryPrice * 1.1;

        return {
          ...p,
          side: newSide,
          liquidationPrice: parseFloat(liqPrice.toFixed(2)),
          pnl: 0,
          roe: 0
        };
      })
    );
  };

  // Order Book Bids & Asks based on activeCoin live price
  const basePrice = activeCoin.price;
  const prec = activeCoin.precision;

  const orderBookAsks: OrderBookRow[] = Array.from({ length: 8 }).map((_, i) => {
    const price = parseFloat((basePrice * (1 + (8 - i) * 0.0004)).toFixed(prec));
    const size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
    return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (8 - i) * 12)) };
  });

  const orderBookBids: OrderBookRow[] = Array.from({ length: 8 }).map((_, i) => {
    const price = parseFloat((basePrice * (1 - (i + 1) * 0.0004)).toFixed(prec));
    const size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
    return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (i + 1) * 12)) };
  });

  // Recent Trades
  const recentTrades: RecentTrade[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `rt-${i}`,
    price: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.0015)).toFixed(prec)),
    size: parseFloat((Math.random() * 1.5 + 0.05).toFixed(3)),
    time: new Date(Date.now() - i * 1200).toTimeString().substring(0, 8),
    side: Math.random() > 0.5 ? 'buy' : 'sell'
  }));

  return (
    <TradingContext.Provider
      value={{
        coins,
        activeCoin,
        setActiveCoinSymbol,
        favorites,
        toggleFavorite,
        priceFlashes,
        openOrders,
        orderHistory,
        allOpenOrders: rawOpenOrders,
        allOrderHistory: rawOrderHistory,
        placeOrder,
        cancelOrder,
        positions,
        allPositions: rawPositions,
        openFuturesPosition,
        closePosition,
        reversePosition,
        orderBookBids,
        orderBookAsks,
        recentTrades,
        feedStatus,
        categoryConfig,
        toggleCategoryFeed,
        manualRefreshFeed
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

