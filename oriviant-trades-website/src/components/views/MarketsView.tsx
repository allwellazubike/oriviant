import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Star, ArrowUpDown, Zap, ArrowUpRight, ArrowDownRight, Layers, Download, RefreshCw } from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { NavigationTab } from '../../types';

interface MarketsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://oriviant-server.onrender.com';

export const MarketsView: React.FC<MarketsViewProps> = ({ onNavigate }) => {
  const { 
    coins: defaultCoins, 
    favorites, 
    toggleFavorite, 
    feedStatus: defaultFeedStatus 
  } = useTrading();
  
  const [coins, setCoins] = useState(defaultCoins);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'change24h' | 'volume24h'>('volume24h');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Real-time telemetry state
  const [isSyncing, setIsSyncing] = useState(false);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [feedTelemetry, setFeedTelemetry] = useState({
    latencyMs: defaultFeedStatus?.latencyMs || 120,
    activeFeedsCount: defaultCoins.length || 0,
    lastUpdated: defaultFeedStatus?.lastUpdated || new Date().toLocaleTimeString(),
    isConnected: true
  });

  const previousPricesRef = useRef<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Markets' },
    { id: 'watchlist', label: '★ Watchlist' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'etfs', label: 'ETFs' },
    { id: 'indices', label: 'Indices' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'metals', label: 'Metals' },
    { id: 'energy', label: 'Energy' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'trending', label: '🔥 Trending' },
    { id: 'gainers', label: '📈 Top Gainers' },
    { id: 'losers', label: '📉 Top Losers' },
    { id: 'new', label: '✨ New Listings' },
    { id: 'traded', label: '⚡ Most Traded' },
  ];

  // Fetch live market data from Render Backend
  const fetchLiveMarkets = useCallback(async () => {
    const startTime = performance.now();
    try {
      setIsSyncing(true);
      // 🔥 UPDATED URL TO MATCH BACKEND ROUTE EXACTLY
      const response = await fetch(`${API_BASE_URL}/api/markets/prices`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const payload = await response.json();
      const rawData = Array.isArray(payload) ? payload : payload.data || payload.markets || [];

      if (Array.isArray(rawData) && rawData.length > 0) {
        const flashes: Record<string, 'up' | 'down'> = {};

        const sanitizedData = rawData.map((item: any) => {
          const prevPrice = previousPricesRef.current[item.symbol];
          const currentPrice = Number(item.price) || 0;

          if (prevPrice !== undefined && prevPrice !== currentPrice) {
            flashes[item.symbol] = currentPrice > prevPrice ? 'up' : 'down';
          }
          previousPricesRef.current[item.symbol] = currentPrice;

          return {
            ...item,
            price: currentPrice,
            change24h: Number(item.change24h) || 0,
            volume24h: Number(item.volume24h) || 0,
            precision: item.precision ?? (currentPrice < 1 ? 4 : 2),
            sparkline: Array.isArray(item.sparkline) && item.sparkline.length > 0 
              ? item.sparkline 
              : [currentPrice * 0.98, currentPrice * 0.99, currentPrice * 1.01, currentPrice]
          };
        });

        setCoins(sanitizedData);
        setPriceFlashes(flashes);

        setTimeout(() => {
          setPriceFlashes({});
        }, 1200);

        const latency = Math.round(performance.now() - startTime);
        setFeedTelemetry({
          latencyMs: latency,
          activeFeedsCount: sanitizedData.length,
          lastUpdated: new Date().toLocaleTimeString(),
          isConnected: true
        });
      }
    } catch (err) {
      console.warn('Backend market feed unavailable, holding local state:', err);
      setFeedTelemetry(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Polling stream every 4 seconds
  useEffect(() => {
    fetchLiveMarkets();
    const intervalId = setInterval(fetchLiveMarkets, 4000);
    return () => clearInterval(intervalId);
  }, [fetchLiveMarkets]);

  const handleSort = (field: 'name' | 'price' | 'change24h' | 'volume24h') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredCoins = coins.filter((coin) => {
    const matchesSearch =
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'watchlist' || selectedCategory === 'favorites') {
      return favorites.includes(coin.symbol);
    }
    if (selectedCategory === 'trending') return Boolean(coin.isTrending);
    if (selectedCategory === 'gainers') return coin.change24h > 0;
    if (selectedCategory === 'losers') return coin.change24h < 0;
    if (selectedCategory === 'new') return Boolean(coin.isNew);
    if (selectedCategory === 'traded') return Boolean(coin.isMostTraded);

    if (selectedCategory !== 'all') {
      return coin.assetClass === selectedCategory || coin.category === selectedCategory;
    }

    return true;
  });

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Markets Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-app tracking-tight">Multi-Asset Marketplace</h1>
          <p className="text-xs text-app-sec">Real-time quotes across Crypto, Forex, Stocks, ETFs, Indices, Commodities & Bonds.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol, name or market (e.g. AAPL, EUR/USD, Gold)"
              className="w-full bg-app-card border border-app rounded-xl pl-10 pr-4 py-2 text-xs text-app placeholder-app-sec focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Live Market Data Feed Status Banner */}
      <div className="p-3.5 rounded-2xl bg-app-card border border-app shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
            feedTelemetry.isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${feedTelemetry.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{feedTelemetry.isConnected ? 'LIVE BACKEND FEED CONNECTED' : 'STANDBY FEED'}</span>
          </div>

          <div className="flex items-center gap-4 text-app-sec text-[11px] font-medium">
            <span>Latency: <strong className="text-app font-bold">{feedTelemetry.latencyMs}ms</strong></span>
            <span>Streaming: <strong className="text-app font-bold">{feedTelemetry.activeFeedsCount} Markets</strong></span>
            <span>Sync Engine: <strong className="text-emerald-500 font-bold">Render REST + Live Ticker</strong></span>
            <span>Last Sync: <strong className="text-app font-bold">{feedTelemetry.lastUpdated}</strong></span>
          </div>
        </div>

        <button
          onClick={fetchLiveMarkets}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app text-xs font-semibold border border-app transition-colors flex items-center gap-1.5 cursor-pointer ml-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Feed Now</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-app">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-accent text-white shadow-sm'
                : 'bg-app-card text-app-sec hover:text-app border border-app'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Comprehensive Market Table */}
      <div className="bg-app-card border border-app rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app bg-app-sec/40 text-[11px] font-bold text-app-sec uppercase tracking-wider">
                <th className="py-3 px-4 w-10">★</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Trading Pair</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Price (USDT)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('change24h')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right hidden md:table-cell cursor-pointer" onClick={() => handleSort('volume24h')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center hidden lg:table-cell">Sparkline (7D)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {sortedCoins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-app-sec">
                    No coins found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                sortedCoins.map((coin) => {
                  const isFav = favorites.includes(coin.symbol);
                  const flash = priceFlashes[coin.symbol];
                  const flashClass = flash === 'up' ? 'bg-emerald-500/20' : flash === 'down' ? 'bg-red-500/20' : '';

                  return (
                    <tr
                      key={coin.id || coin.symbol}
                      className={`hover:bg-app-sec/50 transition-colors ${flashClass}`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleFavorite(coin.symbol)}
                          className="p-1 text-app-sec hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs shrink-0">
                            {coin.symbol.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-app block">{coin.symbol}</span>
                            <span className="text-[10px] text-app-sec">{coin.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-xs text-app">
                        ${coin.price.toLocaleString(undefined, { 
                          minimumFractionDigits: coin.precision ?? 2, 
                          maximumFractionDigits: coin.precision ?? 2 
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                          coin.change24h >= 0 ? 'bg-emerald-500/10 text-positive' : 'bg-red-500/10 text-negative'
                        }`}>
                          {coin.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-xs text-app-sec font-medium hidden md:table-cell">
                        ${(coin.volume24h / 1e6).toFixed(2)}M
                      </td>

                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1 h-6">
                          {Array.isArray(coin.sparkline) && coin.sparkline.map((val: number, idx: number) => {
                            const min = Math.min(...coin.sparkline);
                            const max = Math.max(...coin.sparkline);
                            const heightPercent = Math.max(20, ((val - min) / (max - min || 1)) * 100);
                            return (
                              <div
                                key={idx}
                                style={{ height: `${heightPercent}%` }}
                                className={`w-1 rounded-full ${coin.change24h >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              />
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install'}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-accent hover:bg-accent/90 text-white shadow-sm transition-all flex items-center justify-end gap-1.5 ml-auto cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Trade on App</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};