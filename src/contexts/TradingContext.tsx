import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoCoin, ActiveOrder, FuturesPosition, OrderSide, OrderType, PositionSide, MarginMode, RecentTrade, OrderBookRow } from '../types';
import { INITIAL_COINS } from '../mockData';
import { useDemoMode } from './DemoModeContext';

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
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode, addLedgerEntry } = useDemoMode();
  const [coins, setCoins] = useState<CryptoCoin[]>(INITIAL_COINS);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTC/USDT');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down' | null>>({});

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

  // Real-time simulated price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          // 40% chance to tick this coin
          if (Math.random() > 0.4) return coin;

          const changeFactor = (Math.random() - 0.48) * 0.004; // small fluctuation
          const oldPrice = coin.price;
          const newPrice = Math.max(0.000001, parseFloat((oldPrice * (1 + changeFactor)).toFixed(coin.precision)));
          const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null;

          if (direction) {
            setPriceFlashes((flashes) => ({ ...flashes, [coin.symbol]: direction }));
            setTimeout(() => {
              setPriceFlashes((flashes) => ({ ...flashes, [coin.symbol]: null }));
            }, 600);
          }

          const priceDiffPercent = ((newPrice - oldPrice) / oldPrice) * 100;
          const newChange24h = parseFloat((coin.change24h + priceDiffPercent * 0.1).toFixed(2));
          const newHigh = Math.max(coin.high24h, newPrice);
          const newLow = Math.min(coin.low24h, newPrice);

          return {
            ...coin,
            price: newPrice,
            change24h: newChange24h,
            high24h: newHigh,
            low24h: newLow
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update position mark prices and live PnLs dynamically
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
          amount: -0.0005 * total, // trading fee
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

    // Liquidation estimate: 100 / leverage % away
    const liqFactor = (100 / pos.leverage) * 0.9; // 90% liquidation boundary
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

  // Generated Order Book data relative to activeCoin
  const basePrice = activeCoin.price;
  const prec = activeCoin.precision;

  const orderBookAsks: OrderBookRow[] = Array.from({ length: 8 }).map((_, i) => {
    const price = parseFloat((basePrice * (1 + (8 - i) * 0.0005)).toFixed(prec));
    const size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
    return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (8 - i) * 12)) };
  });

  const orderBookBids: OrderBookRow[] = Array.from({ length: 8 }).map((_, i) => {
    const price = parseFloat((basePrice * (1 - (i + 1) * 0.0005)).toFixed(prec));
    const size = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
    return { price, size, total: price * size, depthPercent: Math.min(100, Math.max(15, (i + 1) * 12)) };
  });

  // Recent Trades
  const recentTrades: RecentTrade[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `rt-${i}`,
    price: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.002)).toFixed(prec)),
    size: parseFloat((Math.random() * 1.5 + 0.05).toFixed(3)),
    time: new Date(Date.now() - i * 1400).toTimeString().substring(0, 8),
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
        recentTrades
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
