import React from 'react';
import { Search, X, TrendingUp, Users, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useTrading } from '../../contexts/TradingContext';
import { NavigationTab } from '../../types';

interface GlobalSearchModalProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, closeSearch, query, setQuery, results, recentSearches, addRecentSearch, clearRecentSearches } = useSearch();
  const { setActiveCoinSymbol } = useTrading();

  if (!isSearchOpen) return null;

  const handleSelectCoin = (symbol: string) => {
    addRecentSearch(symbol);
    setActiveCoinSymbol(symbol);
    onNavigate('spot');
    closeSearch();
  };

  const handleSelectTrader = (name: string) => {
    addRecentSearch(name);
    onNavigate('copy-trading');
    closeSearch();
  };

  const handleSelectArticle = (title: string) => {
    addRecentSearch(title);
    onNavigate('academy');
    closeSearch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-app-card border border-app rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-app flex items-center gap-3 bg-app-sec/40">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins (BTC, SOL), lead traders, academy guides, settings..."
            className="w-full bg-transparent text-sm text-app placeholder-app-sec focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-app-sec hover:text-app">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-app-card border border-app text-app-sec hover:text-app"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Recent Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-app-sec flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-accent hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cryptocurrency Market Results */}
          <div>
            <h4 className="text-xs font-bold text-app-sec uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent" /> Crypto Markets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.coins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin.symbol)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-app-sec/50 hover:bg-app-sec border border-app transition-colors text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-app block">{coin.symbol}</span>
                    <span className="text-[10px] text-app-sec">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-app block">${coin.price.toLocaleString()}</span>
                    <span className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lead Traders Results */}
          <div>
            <h4 className="text-xs font-bold text-app-sec uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" /> Lead Traders
            </h4>
            <div className="space-y-2">
              {results.traders.map((trader) => (
                <button
                  key={trader.id}
                  onClick={() => handleSelectTrader(trader.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-app-sec/50 hover:bg-app-sec border border-app transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={trader.avatar} alt={trader.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-bold text-app block">{trader.name}</span>
                      <span className="text-[10px] text-app-sec">{trader.followers} Copiers • Risk {trader.riskScore}/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-positive block">+{trader.roi30d}% 30D</span>
                    <span className="text-[10px] text-app-sec">{trader.winRate}% Win Rate</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Academy & Guides Results */}
          <div>
            <h4 className="text-xs font-bold text-app-sec uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Academy & Guides
            </h4>
            <div className="space-y-2">
              {results.articles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => handleSelectArticle(art.title)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-app-sec/50 hover:bg-app-sec border border-app transition-colors text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-app block truncate max-w-sm">{art.title}</span>
                    <span className="text-[10px] text-app-sec">{art.category} • {art.readTime}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-app-sec shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
