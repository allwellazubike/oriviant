import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowUpDown, Zap, ArrowUpRight, ArrowDownRight, Layers, RefreshCw } from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { NavigationTab } from '../../types';
import { socketService } from '../../services/socketService';

interface MarketsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({ onNavigate }) => {
  const { coins, setActiveCoinSymbol, favorites, toggleFavorite, priceFlashes, feedStatus, manualRefreshFeed } = useTrading();
  const { t } = useLocalization();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'change24h' | 'volume24h'>('volume24h');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  
  // 🔥 FIX: Added a loading state for the Sync Button
  const [isSyncing, setIsSyncing] = useState(false);

  // Connect to WebSocket and listen for live market ticks
  useEffect(() => {
    socketService.connect();
    
    // Subscribe to all available coins
    coins.forEach(coin => socketService.subscribeToMarket(coin.symbol));

    const handleTick = (data: any) => {
      // Safely patch the live data into our local state overlay
      if (data && (data.symbol || data.s)) {
        const symbol = data.symbol || data.s;
        setLiveData(prev => ({ ...prev, [symbol]: data }));
      }
    };

    const initSocket = () => {
      if (socketService.socket) {
        socketService.socket.on('market_tick', handleTick);
      } else {
        setTimeout(initSocket, 500);
      }
    };
    initSocket();

    return () => {
      coins.forEach(coin => socketService.unsubscribeFromMarket(coin.symbol));
      socketService.socket?.off('market_tick', handleTick);
    };
  }, [coins]);

  const categories = [
    { id: 'all', label: t('markets.catAll') },
    { id: 'watchlist', label: t('markets.catWatchlist') },
    { id: 'crypto', label: t('markets.catCrypto') },
    { id: 'forex', label: t('markets.catForex') },
    { id: 'stocks', label: t('markets.catStocks') },
    { id: 'etfs', label: t('markets.catEtfs') },
    { id: 'indices', label: t('markets.catIndices') },
    { id: 'commodities', label: t('markets.catCommodities') },
    { id: 'metals', label: t('markets.catMetals') },
    { id: 'energy', label: t('markets.catEnergy') },
    { id: 'bonds', label: t('markets.catBonds') },
    { id: 'trending', label: t('markets.catTrending') },
    { id: 'gainers', label: t('markets.catGainers') },
    { id: 'losers', label: t('markets.catLosers') },
    { id: 'new', label: t('markets.catNew') },
    { id: 'traded', label: t('markets.catTraded') },
  ];

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

  // 🔥 FIX: Animated handler for the Sync button
  const handleSyncClick = async () => {
    setIsSyncing(true);
    await manualRefreshFeed();
    // A slight delay guarantees the user sees the spin animation complete
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Markets Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-app tracking-tight">{t('markets.title')}</h1>
          <p className="text-xs text-app-sec">{t('markets.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('markets.searchPlaceholder')}
              className="w-full bg-app-card border border-app rounded-xl pl-10 pr-4 py-2 text-xs text-app placeholder-app-sec focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Live Market Data Feed Status Banner */}
      <div className="p-3.5 rounded-2xl bg-app-card border border-app shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('markets.liveFeedConnected')}</span>
          </div>

          <div className="flex items-center gap-4 text-app-sec text-[11px] font-medium">
            <span>{t('markets.latency')}: <strong className="text-app font-bold">{feedStatus.latencyMs}ms</strong></span>
            <span>{t('markets.streaming')}: <strong className="text-app font-bold">{feedStatus.activeFeedsCount} {t('markets.markets')}</strong></span>
            <span>{t('markets.syncEngine')}: <strong className="text-emerald-500 font-bold">{feedStatus.isWsConnected ? 'Binance WS + FX Stream' : 'REST Stream'}</strong></span>
            <span>{t('markets.lastSync')}: <strong className="text-app font-bold">{feedStatus.lastUpdated}</strong></span>
          </div>
        </div>

        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app text-xs font-semibold border border-app transition-colors flex items-center gap-1.5 cursor-pointer ml-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : t('markets.syncFeedNow')}</span>
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
                    <span>{t('markets.tradingPair')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>{t('markets.priceUsdt')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer" onClick={() => handleSort('change24h')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>{t('markets.change24h')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right hidden md:table-cell cursor-pointer" onClick={() => handleSort('volume24h')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>{t('markets.volume24h')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center hidden lg:table-cell">{t('markets.sparkline7d')}</th>
                <th className="py-3 px-4 text-right">{t('markets.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {sortedCoins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-app-sec">
                    {t('markets.noCoinsFound')} "{searchQuery}"
                  </td>
                </tr>
              ) : (
                sortedCoins.map((coin) => {
                  const isFav = favorites.includes(coin.symbol);
                  const flash = priceFlashes[coin.symbol];
                  const flashClass = flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : '';

                  // Overlay live tick data directly onto the rendered row
                  const live = liveData[coin.symbol];
                  const displayPrice = live?.price !== undefined ? live.price : coin.price;
                  const displayChange = live?.change24h !== undefined ? live.change24h : coin.change24h;
                  const displayVolume = live?.volume24h !== undefined ? live.volume24h : coin.volume24h;

                  return (
                    <tr
                      key={coin.id}
                      onClick={() => {
                        setActiveCoinSymbol(coin.symbol);
                        onNavigate('spot');
                      }}
                      className={`hover:bg-app-sec/50 transition-colors cursor-pointer ${flashClass}`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(coin.symbol);
                          }}
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
                        ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: coin.precision, maximumFractionDigits: coin.precision })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                          displayChange >= 0 ? 'bg-emerald-500/10 text-positive' : 'bg-red-500/10 text-negative'
                        }`}>
                          {displayChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {displayChange >= 0 ? '+' : ''}{displayChange}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-xs text-app-sec font-medium hidden md:table-cell">
                        ${(displayVolume / 1e6).toFixed(2)}M
                      </td>

                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1 h-6">
                          {coin.sparkline.map((val, idx) => {
                            const min = Math.min(...coin.sparkline);
                            const max = Math.max(...coin.sparkline);
                            const heightPercent = Math.max(20, ((val - min) / (max - min || 1)) * 100);
                            return (
                              <div
                                key={idx}
                                style={{ height: `${heightPercent}%` }}
                                className={`w-1 rounded-full ${displayChange >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              />
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCoinSymbol(coin.symbol);
                              onNavigate('spot');
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
                          >
                            {t('markets.spot')}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCoinSymbol(coin.symbol);
                              onNavigate('futures');
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
                          >
                            {t('markets.futures')}
                          </button>
                        </div>
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