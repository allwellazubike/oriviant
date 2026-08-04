import React, { useState } from 'react';
import { Search, Star, ArrowUpDown, Zap, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { NavigationTab } from '../../types';

interface MarketsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({ onNavigate }) => {
  const { coins, setActiveCoinSymbol, favorites, toggleFavorite, priceFlashes } = useTrading();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'change24h' | 'volume24h'>('volume24h');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const categories = [
    { id: 'all', label: 'All Markets' },
    { id: 'favorites', label: '★ Favorites' },
    { id: 'spot', label: 'Spot' },
    { id: 'futures', label: 'Futures 125x' },
    { id: 'layer1', label: 'Layer 1' },
    { id: 'ai', label: 'AI & Data' },
    { id: 'meme', label: 'Meme' },
    { id: 'defi', label: 'DeFi' },
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

    if (selectedCategory === 'favorites') return matchesSearch && favorites.includes(coin.symbol);
    if (selectedCategory === 'spot' || selectedCategory === 'futures') return matchesSearch;
    if (selectedCategory !== 'all') return matchesSearch && coin.category === selectedCategory;

    return matchesSearch;
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
          <h1 className="text-2xl font-black text-app tracking-tight">Crypto Markets</h1>
          <p className="text-xs text-app-sec">Real-time prices, 24h volume analytics & high-leverage perpetuals.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coin name or symbol (e.g. BTC)"
            className="w-full bg-app-card border border-app rounded-xl pl-10 pr-4 py-2 text-xs text-app placeholder-app-sec focus:outline-none focus:border-accent"
          />
        </div>
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
                  const flashClass = flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : '';

                  return (
                    <tr
                      key={coin.id}
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
                        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.precision, maximumFractionDigits: coin.precision })}
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
                          {coin.sparkline.map((val, idx) => {
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveCoinSymbol(coin.symbol);
                              onNavigate('spot');
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
                          >
                            Spot
                          </button>
                          <button
                            onClick={() => {
                              setActiveCoinSymbol(coin.symbol);
                              onNavigate('futures');
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
                          >
                            Futures
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
