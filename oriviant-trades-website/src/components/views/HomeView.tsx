import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Download
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { HeroSection } from '../home/HeroSection';
import { MarketAnalyticsChart } from '../home/MarketAnalyticsChart';
import { HomeFeaturesSection } from '../home/HomeFeaturesSection';
import { AssetIcon } from '../common/AssetIcon';
import { AuthModal } from '../modals/AuthModal';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [activeMarketTab, setActiveMarketTab] = useState<'Hot Futures' | 'Hot Coins' | 'Forex' | 'Stocks' | 'Indices' | 'Metals'>('Hot Futures');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Market Category Data using real crypto & asset icons
  const getMarketData = () => {
    switch (activeMarketTab) {
      case 'Hot Futures':
        return [
          { symbol: 'BTC', pair: 'BTC Perpetual', name: 'Bitcoin', price: '$94,839.60', change: '+2.39%', isPositive: true },
          { symbol: 'ETH', pair: 'ETH Perpetual', name: 'Ethereum', price: '$3,422.16', change: '+1.61%', isPositive: true },
          { symbol: 'SOL', pair: 'SOL Perpetual', name: 'Solana', price: '$188.69', change: '+3.23%', isPositive: true },
          { symbol: 'DOGE', pair: 'DOGE Perpetual', name: 'Dogecoin', price: '$0.3705', change: '+0.56%', isPositive: true },
          { symbol: 'GRAM', pair: 'GRAM Perpetual', name: 'Gram', price: '$1.4150', change: '+1.65%', isPositive: true },
        ];
      case 'Hot Coins':
        return [
          { symbol: 'BTC', pair: 'BTC/USDT', name: 'Bitcoin', price: '$94,839.60', change: '+2.39%', isPositive: true },
          { symbol: 'ETH', pair: 'ETH/USDT', name: 'Ethereum', price: '$3,422.16', change: '+1.61%', isPositive: true },
          { symbol: 'SOL', pair: 'SOL/USDT', name: 'Solana', price: '$188.69', change: '+3.23%', isPositive: true },
          { symbol: 'BNB', pair: 'BNB/USDT', name: 'BNB Chain', price: '$620.40', change: '+0.95%', isPositive: true },
          { symbol: 'XRP', pair: 'XRP/USDT', name: 'Ripple', price: '$1.1240', change: '+5.80%', isPositive: true },
        ];
      case 'Forex':
        return [
          { symbol: 'EUR', pair: 'EUR/USD', name: 'Euro / US Dollar', price: '1.0845', change: '-0.12%', isPositive: false },
          { symbol: 'GBP', pair: 'GBP/USD', name: 'British Pound / USD', price: '1.2980', change: '+0.25%', isPositive: true },
          { symbol: 'USD', pair: 'USD/JPY', name: 'US Dollar / Yen', price: '154.20', change: '+0.45%', isPositive: true },
          { symbol: 'AUD', pair: 'AUD/USD', name: 'Aussie / US Dollar', price: '0.6580', change: '-0.18%', isPositive: false },
          { symbol: 'USD', pair: 'USD/CHF', name: 'USD / Swiss Franc', price: '0.8840', change: '+0.10%', isPositive: true },
        ];
      case 'Stocks':
        return [
          { symbol: 'AAPL', pair: 'Apple Inc.', name: 'Apple Stock', price: '$232.50', change: '+1.42%', isPositive: true },
          { symbol: 'NVDA', pair: 'NVIDIA Corp.', name: 'Nvidia Corp', price: '$145.80', change: '+4.15%', isPositive: true },
          { symbol: 'TSLA', pair: 'Tesla Inc.', name: 'Tesla Inc', price: '$248.20', change: '+2.88%', isPositive: true },
          { symbol: 'MSFT', pair: 'Microsoft', name: 'Microsoft Corp', price: '$428.10', change: '+0.75%', isPositive: true },
          { symbol: 'AMZN', pair: 'Amazon.com', name: 'Amazon Inc', price: '$186.40', change: '+1.20%', isPositive: true },
        ];
      case 'Indices':
        return [
          { symbol: 'NDX', pair: 'NASDAQ 100', name: 'US Tech 100 Index', price: '20,412.30', change: '+1.15%', isPositive: true },
          { symbol: 'SPX', pair: 'S&P 500', name: 'US Large Cap 500', price: '5,882.20', change: '+0.78%', isPositive: true },
          { symbol: 'DJI', pair: 'Dow Jones 30', name: 'US Wall Street 30', price: '42,810.00', change: '+0.42%', isPositive: true },
          { symbol: 'UK100', pair: 'FTSE 100', name: 'UK 100 Index', price: '8,240.10', change: '+0.15%', isPositive: true },
          { symbol: 'GER40', pair: 'DAX 40', name: 'Germany 40 Index', price: '19,450.60', change: '+0.65%', isPositive: true },
        ];
      case 'Metals':
        return [
          { symbol: 'XAU', pair: 'XAU/USD', name: 'Gold Spot', price: '$2,748.90', change: '+0.85%', isPositive: true },
          { symbol: 'XAG', pair: 'XAG/USD', name: 'Silver Spot', price: '$32.40', change: '+1.45%', isPositive: true },
          { symbol: 'PLAT', pair: 'XPT/USD', name: 'Platinum Spot', price: '$985.20', change: '+0.62%', isPositive: true },
          { symbol: 'PALL', pair: 'XPD/USD', name: 'Palladium Spot', price: '$1,040.50', change: '-0.35%', isPositive: false },
          { symbol: 'OIL', pair: 'USOIL', name: 'Crude Oil WTI', price: '$72.15', change: '-0.42%', isPositive: false },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO SECTION WITH BLACK SUPERCAR & TOOBIT PROMO CAMPAIGN */}
      <HeroSection onNavigate={onNavigate} />

      {/* 2. START TRADING CTA BANNER (TOOBIT STYLE RECTANGULAR STRIP) */}
      <div className="py-2">
        <div className="w-full py-3.5 px-4 sm:px-6 md:px-8 rounded-none bg-transparent border border-app text-app flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-none bg-app-card border border-app flex items-center justify-center text-cyan-500 shrink-0">
              <Globe className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-app tracking-tight leading-tight truncate">
                Start Trading on ORIVIANT
              </h3>
              <p className="text-[11px] sm:text-xs text-app-sec font-normal leading-snug break-words">
                Access global liquidity and trade crypto, forex & equities with sub-10ms execution speed.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2 rounded-none bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer tracking-wide whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. MARKET SECTION ("Every Trade Brings New Opportunities") */}
      <div className="py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              GLOBAL ASSET COVERAGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-app mt-2">Every Trade Brings New Opportunities</h2>
            <p className="text-xs text-app-sec">Explore real-time quotes across Crypto, Forex, Equities, Commodities and Indices.</p>
          </div>

          <button
            onClick={() => onNavigate('markets')}
            className="px-4 py-2 rounded-xl bg-app-card hover:bg-app-sec text-app font-bold text-xs border border-app transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Markets</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Swipeable Category Tabs on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x">
          {(['Hot Futures', 'Hot Coins', 'Forex', 'Stocks', 'Indices', 'Metals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMarketTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer snap-start ${
                activeMarketTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-app-card text-app-sec hover:text-app hover:bg-app-sec border border-app'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Market List Display */}
        <div className="space-y-2">
          {getMarketData().map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('markets')}
              className="p-3.5 sm:p-4 rounded-2xl bg-app-card hover:bg-app-sec border border-app transition-all flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <AssetIcon symbol={item.symbol} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-app">{item.symbol}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-app-sec text-app-sec border border-app font-bold hidden sm:inline-block">
                      {item.pair}
                    </span>
                  </div>
                  <span className="text-[11px] text-app-sec">{item.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-mono font-black text-app block">{item.price}</span>
                  <span className={`text-xs font-bold flex items-center justify-end gap-0.5 ${item.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.isPositive ? <ArrowUpRight className="w-3 h-3 stroke-[3]" /> : <ArrowDownRight className="w-3 h-3 stroke-[3]" />}
                    {item.change}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-xl bg-app-sec border border-app flex items-center justify-center text-app-sec group-hover:text-cyan-500 group-hover:border-blue-500/40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. BLOOMBERG-GRADE ANIMATED AREA CHART & METRICS */}
      <MarketAnalyticsChart />

      {/* 5. PLATFORM FEATURES SECTION */}
      <HomeFeaturesSection onNavigate={onNavigate} />

      {/* 7. SECURITY SECTION PREVIEW */}
      <div className="p-6 sm:p-8 rounded-md bg-transparent border border-app text-app flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" /> Institutional Cold Vaults
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-app">Your Capital Protected 24/7/365</h2>
          <p className="text-xs sm:text-sm text-app-sec leading-relaxed">
            Multi-signature cold storage vaults, end-to-end hardware encryption, biometric login, 2FA authentication, and 100% cryptographic proof of reserves.
          </p>
        </div>

        <button
          onClick={() => onNavigate('security')}
          className="px-6 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Explore Security Architecture</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8. VERIFIED REVIEWS SECTION PREVIEW */}
      <div className="p-6 sm:p-8 rounded-md bg-transparent border border-app space-y-6">
        <div className="flex items-center justify-between border-b border-app pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
              VERIFIED REVIEWS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-app mt-2">Trusted by 4 Million+ Traders</h2>
            <p className="text-xs text-app-sec">Read authenticated testimonials from active traders around the world.</p>
          </div>

          <button
            onClick={() => onNavigate('reviews')}
            className="px-4 py-2 rounded-md bg-app-card hover:bg-app-sec text-app font-bold text-xs border border-app transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Read All Reviews</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Alexander V.',
              location: 'Germany',
              role: 'VIP Trader',
              comment: 'The sub-10ms order execution on ORIVIANT is unmatched. Liquidity is rock-solid even during volatile market spikes.',
              rating: 5
            },
            {
              name: 'Sophia L.',
              location: 'Singapore',
              role: 'Elite Trader',
              comment: '100% Proof of Reserves and multi-sig cold storage gives me complete peace of mind when holding crypto balances.',
              rating: 5
            },
            {
              name: 'Carlos M.',
              location: 'Spain',
              role: 'Active Trader',
              comment: 'The mobile app interface is super clean and responsive. Live push alerts and chart tools are top-tier.',
              rating: 5
            }
          ].map((rev, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-app-card border border-app space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-app">{rev.name}</h4>
                  <span className="text-[10px] text-app-sec">{rev.location} • {rev.role}</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-xs text-app-sec leading-relaxed font-normal">"{rev.comment}"</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 pt-2 border-t border-app">
                <CheckCircle2 className="w-3 h-3" /> Verified Trade Account
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. DOWNLOAD APP SECTION */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#101828] dark:bg-gradient-to-r dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 border border-slate-800 dark:border-indigo-500/25 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1677FF]/20 text-[#00C2FF] border border-[#1677FF]/30 text-xs font-black uppercase">
            <Smartphone className="w-4 h-4" /> ORIVIANT MOBILE ENGINE
          </div>
          <h2 className="text-3xl font-black text-white">Trade Anywhere with the ORIVIANT App</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Download the official Android APK for real-time mobile order execution, biometric hardware key login, push price alerts, and instant deposit options.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Android APK Ready</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 border border-white/10">iOS (Coming Soon)</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 border border-white/10">Windows & Mac (Coming Soon)</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('download')}
          className="px-8 py-4 rounded-2xl bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-extrabold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider"
        >
          <Download className="w-5 h-5" />
          <span>Download App Now</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
        onNavigate={onNavigate}
      />

    </div>
  );
};
