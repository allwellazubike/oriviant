import React, { useState } from 'react';
import { 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Gift, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  ChevronRight,
  Flame,
  Gauge,
  Smartphone
} from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useCopyTrading } from '../../contexts/CopyTradingContext';
import { NavigationTab } from '../../types';
import { HeroCarousel } from '../home/HeroCarousel';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { coins, setActiveCoinSymbol, favorites, toggleFavorite } = useTrading();
  const { demoBalance, refillDemoFunds, isDemoMode } = useDemoMode();
  const { traders } = useCopyTrading();

  const topGainers = [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, 4);
  const topLosers = [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, 4);
  const volumeLeaders = [...coins].sort((a, b) => b.volume24h - a.volume24h).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Hero Carousel */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Spot Trading', icon: Layers, tab: 'spot' as NavigationTab, color: 'text-blue-500' },
          { label: 'Futures 125x', icon: Zap, tab: 'futures' as NavigationTab, color: 'text-red-500' },
          { label: 'Copy Trading', icon: Users, tab: 'copy-trading' as NavigationTab, color: 'text-emerald-500' },
          { label: 'Demo Mode', icon: RefreshCw, tab: 'demo-workspace' as NavigationTab, color: 'text-amber-500' },
          { label: 'Academy', icon: BookOpen, tab: 'academy' as NavigationTab, color: 'text-indigo-500' },
          { label: 'Referral Hub', icon: Gift, tab: 'referral' as NavigationTab, color: 'text-purple-500' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className="p-4 rounded-2xl bg-app-card hover:bg-app-sec border border-app transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-sm"
            >
              <div className={`p-2.5 rounded-xl bg-app-sec group-hover:scale-110 transition-transform ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-app">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fear & Greed Index Dial + Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fear & Greed Dial Widget */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-app flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-500" />
                Crypto Fear & Greed Index
              </h3>
              <span className="text-xs text-app-sec font-medium">Updated 1h ago</span>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl font-black text-emerald-500 mb-1">78</div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 inline-block px-3 py-1 rounded-full border border-emerald-500/20">
                Extreme Greed
              </div>
            </div>

            {/* Scale Bar */}
            <div className="w-full bg-app-sec h-2.5 rounded-full overflow-hidden flex my-4">
              <div className="w-1/4 bg-red-500 h-full" />
              <div className="w-1/4 bg-amber-500 h-full" />
              <div className="w-1/4 bg-emerald-500/50 h-full" />
              <div className="w-1/4 bg-emerald-500 h-full" />
            </div>
          </div>

          <p className="text-[11px] text-app-sec leading-relaxed">
            Market sentiment is strongly bullish. Traders are aggressively adding long exposure across Layer 1 and AI tokens.
          </p>
        </div>

        {/* Top 24h Gainers */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-500" />
              Top 24h Gainers
            </h3>
            <button
              onClick={() => onNavigate('markets')}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topGainers.map((coin) => (
              <div
                key={coin.id}
                onClick={() => {
                  setActiveCoinSymbol(coin.symbol);
                  onNavigate('spot');
                }}
                className="p-2.5 rounded-xl bg-app-sec/40 hover:bg-app-sec border border-app transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-app block">{coin.symbol}</span>
                  <span className="text-[10px] text-app-sec">{coin.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-app block">${coin.price.toLocaleString()}</span>
                  <span className="text-xs font-bold text-positive flex items-center justify-end gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +{coin.change24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Leaders */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              24h Volume Leaders
            </h3>
            <button
              onClick={() => onNavigate('markets')}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {volumeLeaders.map((coin) => (
              <div
                key={coin.id}
                onClick={() => {
                  setActiveCoinSymbol(coin.symbol);
                  onNavigate('spot');
                }}
                className="p-2.5 rounded-xl bg-app-sec/40 hover:bg-app-sec border border-app transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-app block">{coin.symbol}</span>
                  <span className="text-[10px] text-app-sec">Vol ${(coin.volume24h / 1e9).toFixed(2)}B</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-app block">${coin.price.toLocaleString()}</span>
                  <span className={`text-xs font-bold ${coin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Copy Trading Highlight Banner */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PRO COPY TRADING
              </span>
            </div>
            <h3 className="text-lg font-bold text-app">Automate Profits with Top Lead Traders</h3>
            <p className="text-xs text-app-sec">Copy trades 1:1 automatically. No manual execution required.</p>
          </div>

          <button
            onClick={() => onNavigate('copy-trading')}
            className="px-4 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <span>Explore All Lead Traders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lead Trader Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {traders.slice(0, 3).map((trader) => (
            <div
              key={trader.id}
              className="p-4 rounded-2xl bg-app-sec/50 border border-app hover:border-accent/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={trader.avatar} alt={trader.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/30" />
                  <div>
                    <h4 className="text-xs font-bold text-app">{trader.name}</h4>
                    <span className="text-[10px] text-app-sec">{trader.followers} Copiers • Risk {trader.riskScore}/10</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/10 text-emerald-500">
                  +{trader.roi30d}% 30D
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-app/60">
                <span className="text-app-sec">Win Rate: <strong className="text-app">{trader.winRate}%</strong></span>
                <span className="text-app-sec">AUM: <strong className="text-app">${(trader.aum / 1e6).toFixed(2)}M</strong></span>
              </div>

              <button
                onClick={() => onNavigate('copy-trading')}
                className="w-full py-2 rounded-xl bg-app-card hover:bg-app-sec text-accent font-bold text-xs border border-app transition-colors"
              >
                Copy This Trader
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
