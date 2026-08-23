import React, { useState } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Download, 
  Layers, 
  Zap, 
  Users, 
  Wallet, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  BarChart2,
  Activity,
  X,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { NavigationTab } from '../../types';

interface WelcomeViewProps {
  onNavigate?: (tab: NavigationTab) => void;
}

interface MarketAsset {
  symbol: string;
  name: string;
  type: 'Crypto' | 'Commodities' | 'Forex' | 'Stocks';
  price: string;
  change24h: number;
  sparkline: number[];
}

const MARKET_PREVIEWS: MarketAsset[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', type: 'Crypto', price: '$68,420.50', change24h: 3.42, sparkline: [40, 42, 41, 44, 43, 47, 46, 50] },
  { symbol: 'ETH/USDT', name: 'Ethereum', type: 'Crypto', price: '$3,540.20', change24h: 2.15, sparkline: [20, 22, 21, 25, 24, 27, 26, 29] },
  { symbol: 'SOL/USDT', name: 'Solana', type: 'Crypto', price: '$182.75', change24h: 6.80, sparkline: [15, 17, 16, 20, 22, 25, 27, 30] },
  { symbol: 'XAU/USD', name: 'Gold Spot', type: 'Commodities', price: '$2,410.80', change24h: 0.75, sparkline: [50, 51, 50, 52, 51, 53, 52, 54] },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'Forex', price: '1.0895', change24h: -0.12, sparkline: [30, 29, 28, 29, 27, 26, 27, 25] },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stocks', price: '$224.30', change24h: 1.45, sparkline: [10, 11, 12, 11, 13, 14, 15, 16] },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stocks', price: '$218.60', change24h: 4.10, sparkline: [18, 19, 17, 20, 21, 23, 22, 25] },
];

const ASSET_CLASS_KEYS: Record<MarketAsset['type'], 'assetClass.crypto' | 'assetClass.commodities' | 'assetClass.forex' | 'assetClass.stocks'> = {
  Crypto: 'assetClass.crypto',
  Commodities: 'assetClass.commodities',
  Forex: 'assetClass.forex',
  Stocks: 'assetClass.stocks'
};

export const WelcomeView: React.FC<WelcomeViewProps> = () => {
  const { openAuthModal } = useUser();
  const { t } = useLocalization();
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [attemptedFeature, setAttemptedFeature] = useState<string>('');

  useOverlayRegistration('welcome-login-modal', isLoginRequiredModalOpen, () => setIsLoginRequiredModalOpen(false));

  const handleDownloadApk = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 4000);
    }, 1800);
  };

  const triggerLoginPrompt = (featureName: string) => {
    setAttemptedFeature(featureName);
    setIsLoginRequiredModalOpen(true);
  };

  const platformFeatures = [
    {
      title: t('welcome.feat1Title'),
      badge: t('welcome.feat1Badge'),
      description: t('welcome.feat1Desc'),
      icon: Layers,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/20',
    },
    {
      title: t('welcome.feat2Title'),
      badge: t('welcome.feat2Badge'),
      description: t('welcome.feat2Desc'),
      icon: Zap,
      color: 'from-red-500/20 to-orange-500/10 text-red-500 border-red-500/20',
    },
    {
      title: t('welcome.feat3Title'),
      badge: t('welcome.feat3Badge'),
      description: t('welcome.feat3Desc'),
      icon: Zap,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      title: t('welcome.feat4Title'),
      badge: t('welcome.feat4Badge'),
      description: t('welcome.feat4Desc'),
      icon: Users,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-500 border-purple-500/20',
    },
    {
      title: t('welcome.feat5Title'),
      badge: t('welcome.feat5Badge'),
      description: t('welcome.feat5Desc'),
      icon: BookOpen,
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/20',
    },
    {
      title: t('welcome.feat6Title'),
      badge: t('welcome.feat6Badge'),
      description: t('welcome.feat6Desc'),
      icon: Wallet,
      color: 'from-indigo-500/20 to-cyan-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      title: t('welcome.feat7Title'),
      badge: t('welcome.feat7Badge'),
      description: t('welcome.feat7Desc'),
      icon: TrendingUp,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/20',
    },
    {
      title: t('welcome.feat8Title'),
      badge: t('welcome.feat8Badge'),
      description: t('welcome.feat8Desc'),
      icon: BarChart2,
      color: 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/20',
    },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-6 px-3 sm:px-6 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-6 pt-4 sm:pt-8">
        
        {/* Logo Branding */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-1 shadow-2xl shadow-blue-500/30 group">
            <div className="w-full h-full bg-app-card rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-app uppercase">
              ORIVIANT
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-widest text-accent mt-1 uppercase">
              TRADE • INVEST • GROW
            </p>
          </div>
        </div>

        {/* Short Introduction */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-app">
            {t('welcome.title')}
          </h2>
          <p className="text-sm sm:text-base text-app-sec leading-relaxed font-normal">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Primary Buttons: Log In & Create Account */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-accent hover:bg-accent/90 text-white font-extrabold text-sm shadow-xl shadow-accent/25 hover:shadow-accent/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('welcome.logIn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-app-sec hover:bg-app-sec/80 text-app font-extrabold text-sm border border-app shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('welcome.createAccount')}</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </button>
        </div>

        {/* Secondary Buttons: Visit Website & Support */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://oriviant.io"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-app-sec/60 hover:bg-app-sec text-app-sec hover:text-app text-xs font-bold border border-app transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{t('welcome.visitWebsite')}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            onClick={() => triggerLoginPrompt('Support Portal')}
            className="px-4 py-2.5 rounded-xl bg-app-sec/60 hover:bg-app-sec text-app-sec hover:text-app text-xs font-bold border border-app transition-colors flex items-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span>{t('welcome.support')}</span>
          </button>

          <button
            onClick={handleDownloadApk}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold border border-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloadComplete ? (
              <span>{t('welcome.apkDownloaded')}</span>
            ) : downloading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span>{t('welcome.downloadingApk')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t('welcome.downloadLatestApk')}</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 font-mono rounded">v2.4.1</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 2. FEATURE PREVIEW (Informational Only) */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-black tracking-widest text-accent uppercase">
            {t('welcome.ecosystemPreview')}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-app">
            {t('welcome.platformCapabilities')}
          </h3>
          <p className="text-xs text-app-sec">
            {t('welcome.engineeredFor')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformFeatures.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                onClick={() => triggerLoginPrompt(item.title)}
                className="group p-5 rounded-3xl bg-app-card border border-app hover:border-accent/40 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-app-sec text-app-sec border border-app">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-app group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-app-sec leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-app/50 flex items-center justify-between text-[11px] font-bold text-accent">
                  <span>{t('welcome.explore')} {item.title}</span>
                  <Lock className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LIVE MARKET PREVIEW */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-black tracking-widest text-accent uppercase">
            {t('welcome.realTimeData')}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-app">
            {t('welcome.liveMarketPreview')}
          </h3>
          <p className="text-xs text-app-sec">
            {t('welcome.guestsMayView')}
          </p>
        </div>

        <div className="bg-app-card border border-app rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app/80 bg-app-sec/40 text-[11px] font-extrabold uppercase text-app-sec tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">{t('welcome.asset')}</th>
                  <th className="py-3.5 px-4">{t('welcome.class')}</th>
                  <th className="py-3.5 px-4 text-right">{t('welcome.price')}</th>
                  <th className="py-3.5 px-4 text-right">{t('welcome.change24h')}</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">{t('welcome.sparkline')}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">{t('welcome.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/50 text-xs">
                {MARKET_PREVIEWS.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-app-sec/30 transition-colors">
                    
                    {/* Symbol & Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-extrabold text-app">{asset.symbol}</div>
                      <div className="text-[10px] text-app-sec font-medium">{asset.name}</div>
                    </td>

                    {/* Class Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-app-sec text-app-sec border border-app">
                        {t(ASSET_CLASS_KEYS[asset.type])}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-app">
                      {asset.price}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                          asset.change24h >= 0
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-red-500/15 text-red-500'
                        }`}
                      >
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </td>

                    {/* Sparkline */}
                    <td className="py-3.5 px-4 text-center hidden md:table-cell">
                      <svg className="w-20 h-6 inline-block" viewBox="0 0 80 30">
                        <polyline
                          fill="none"
                          stroke={asset.change24h >= 0 ? '#10B981' : '#EF4444'}
                          strokeWidth="2"
                          points={asset.sparkline
                            .map((val, idx) => `${idx * 11},${30 - val * 0.5}`)
                            .join(' ')}
                        />
                      </svg>
                    </td>

                    {/* Trade / Buy Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => triggerLoginPrompt(`Trade ${asset.symbol}`)}
                          className="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{t('welcome.trade')}</span>
                          <Lock className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. TRUST & SECURITY BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 border border-app shadow-md flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-app">{t('welcome.reservesTitle')}</h4>
            <p className="text-xs text-app-sec mt-0.5">{t('welcome.reservesDesc')}</p>
          </div>
        </div>

        <button
          onClick={() => openAuthModal('signup')}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-md shadow-accent/20 hover:bg-accent/90 transition-all shrink-0 cursor-pointer"
        >
          {t('welcome.joinToday')}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. LOGIN REQUIRED MODAL (Triggered on Guest Action)       */}
      {/* ========================================================= */}
      {isLoginRequiredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-app-card border border-app rounded-3xl shadow-2xl p-6 relative text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLoginRequiredModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/20 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-app">
                {t('welcome.loginRequired')}
              </h3>
              <p className="text-xs text-app-sec mt-1.5 leading-relaxed">
                {t('welcome.loginRequiredPrefix')} {attemptedFeature || t('welcome.tradingFeatures')} {t('welcome.loginRequiredSuffix')}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsLoginRequiredModalOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-lg shadow-accent/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('welcome.logIn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsLoginRequiredModalOpen(false);
                  openAuthModal('signup');
                }}
                className="w-full py-3 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app transition-all cursor-pointer"
              >
                {t('welcome.createAccount')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
