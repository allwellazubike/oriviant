import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  Users, 
  Globe, 
  ShieldCheck, 
  BookOpen, 
  BarChart2,
  RefreshCw, 
  Award,
  TrendingUp,
  Smartphone
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface HeroCarouselProps {
  onNavigate: (tab: NavigationTab) => void;
}

interface SlideData {
  id: string;
  badge: string;
  badgeIcon: React.ElementType;
  heading: string;
  description: string;
  primaryBtnText: string;
  primaryBtnTab: NavigationTab;
  secondaryBtnText?: string;
  secondaryBtnTab?: NavigationTab;
  gradient: string;
  accentGlow: string;
  graphicType: 'trading' | 'demo' | 'copy' | 'markets' | 'security' | 'academy';
}

const SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    badge: 'TRADE CRYPTO',
    badgeIcon: Sparkles,
    heading: 'Next-Gen Crypto Trading Platform',
    description: 'Access 250+ crypto assets including BTC, ETH, SOL and top altcoins with deep liquidity and zero slippage.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Explore Markets',
    secondaryBtnTab: 'markets',
    gradient: 'from-blue-950 via-indigo-950 to-slate-950 border-blue-500/30',
    accentGlow: 'bg-blue-500/15',
    graphicType: 'trading',
  },
  {
    id: 'slide-2',
    badge: 'FOREX MARKETS',
    badgeIcon: Globe,
    heading: 'Global Forex Currency Pairs',
    description: 'Trade major, minor, and exotic currency pairs EUR/USD, GBP/USD, USD/JPY with ultra-fast sub-millisecond execution.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Explore Markets',
    secondaryBtnTab: 'markets',
    gradient: 'from-emerald-950 via-teal-950 to-slate-950 border-emerald-500/30',
    accentGlow: 'bg-emerald-500/15',
    graphicType: 'markets',
  },
  {
    id: 'slide-3',
    badge: 'STOCKS & INDICES',
    badgeIcon: TrendingUp,
    heading: 'Global Equities & Indices',
    description: 'Trade top international stocks (Apple, Tesla, Microsoft) and major world indices (NASDAQ, S&P 500, Dow Jones).',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Create Account',
    secondaryBtnTab: 'signup',
    gradient: 'from-purple-950 via-indigo-950 to-slate-950 border-purple-500/30',
    accentGlow: 'bg-purple-500/15',
    graphicType: 'demo',
  },
  {
    id: 'slide-4',
    badge: 'GOLD, SILVER & COMMODITIES',
    badgeIcon: Zap,
    heading: 'Precious Metals & Commodities',
    description: 'Trade Gold (XAU), Silver (XAG), US Crude Oil, and Natural Gas with raw spreads and leverage up to 1:500.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Explore Markets',
    secondaryBtnTab: 'markets',
    gradient: 'from-amber-950 via-yellow-950 to-slate-950 border-amber-500/30',
    accentGlow: 'bg-amber-500/15',
    graphicType: 'trading',
  },
  {
    id: 'slide-5',
    badge: 'COPY TRADING',
    badgeIcon: Users,
    heading: 'Automate Profits with Lead Traders',
    description: 'Mirror top-performing verified traders automatically 1:1. Zero management fees, full control.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Platform Features',
    secondaryBtnTab: 'features',
    gradient: 'from-emerald-950 via-indigo-950 to-slate-950 border-emerald-500/30',
    accentGlow: 'bg-emerald-500/15',
    graphicType: 'copy',
  },
  {
    id: 'slide-6',
    badge: 'MOBILE APP & FAST EXECUTION',
    badgeIcon: Smartphone,
    heading: 'Mobile Trading Engine',
    description: 'Experience ultra-low latency sub-10ms trade execution with live push notifications & real-time order tracking.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Create Account',
    secondaryBtnTab: 'signup',
    gradient: 'from-indigo-950 via-cyan-950 to-slate-950 border-indigo-500/30',
    accentGlow: 'bg-indigo-500/15',
    graphicType: 'demo',
  },
  {
    id: 'slide-7',
    badge: 'SECURE PLATFORM',
    badgeIcon: ShieldCheck,
    heading: 'Institutional Grade Security & 1:1 Reserves',
    description: '100% Proof of Reserves, multi-signature cold storage, end-to-end encryption & 24/7 dedicated security monitoring.',
    primaryBtnText: 'Download App',
    primaryBtnTab: 'download',
    secondaryBtnText: 'Security Architecture',
    secondaryBtnTab: 'security',
    gradient: 'from-cyan-950 via-slate-950 to-blue-950 border-cyan-500/30',
    accentGlow: 'bg-cyan-500/15',
    graphicType: 'security',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play interval timer (every 4.5s)
  useEffect(() => {
    if (isPaused || isDragging) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, isDragging, nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setIsDragging(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diffX = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 35;

      if (diffX > minSwipeDistance) {
        nextSlide();
      } else if (diffX < -minSwipeDistance) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsDragging(false);
    setIsPaused(false);
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on main button click
    if (e.button !== 0) return;
    setIsPaused(true);
    setIsDragging(true);
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      touchEndXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
        const diffX = touchStartXRef.current - touchEndXRef.current;
        const minSwipeDistance = 35;

        if (diffX > minSwipeDistance) {
          nextSlide();
        } else if (diffX < -minSwipeDistance) {
          prevSlide();
        }
      }
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      setIsDragging(false);
    }
    setIsPaused(false);
  };

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const currentSlide = SLIDES[currentIndex];
  const BadgeIcon = currentSlide.badgeIcon;

  // Render graphic illustration corresponding to each slide topic
  const renderGraphic = (type: SlideData['graphicType']) => {
    switch (type) {
      case 'trading':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            {/* Glowing Backdrop Circle */}
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
            
            {/* Main Trading Card */}
            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-blue-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2.5 mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] sm:text-xs">₿</div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-black text-white">BTC/USDT</div>
                    <div className="text-[8px] sm:text-[10px] text-emerald-400 font-bold">Perpetual 125x</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400">$68,420.50</div>
                  <div className="text-[8px] sm:text-[10px] text-emerald-400 font-bold">+3.42%</div>
                </div>
              </div>

              {/* Simulated Candlestick Chart */}
              <div className="h-8 sm:h-16 flex items-end justify-between gap-1 sm:gap-1.5 px-0.5 sm:px-1 py-0.5 sm:py-1">
                {[35, 45, 40, 60, 55, 75, 70, 90, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className={`w-full rounded-sm ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* Order depth badges */}
              <div className="mt-1.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-md sm:rounded-lg p-1 sm:p-1.5 text-center">
                  <span className="text-emerald-400 font-bold">Long 125x</span>
                  <div className="text-slate-300 font-mono text-[8px] sm:text-[9px] mt-0.5 hidden sm:block">Limit $68,400</div>
                </div>
                <div className="bg-blue-500/15 border border-blue-500/30 rounded-md sm:rounded-lg p-1 sm:p-1.5 text-center">
                  <span className="text-blue-400 font-bold">Spot Buy</span>
                  <div className="text-slate-300 font-mono text-[8px] sm:text-[9px] mt-0.5 hidden sm:block">Market Instant</div>
                </div>
              </div>
            </div>

            {/* Floating Floating Badges */}
            <div className="absolute -top-1 -right-1 sm:top-2 sm:right-2 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-blue-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>0.01% Fees</span>
            </div>
          </div>
        );

      case 'demo':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
            
            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl space-y-1.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Practice Mode
                </span>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">
                  Virtual Funds
                </span>
              </div>

              <div>
                <div className="text-[9px] sm:text-[11px] text-slate-400 font-medium">Demo Balance</div>
                <div className="text-base sm:text-2xl font-black font-mono text-emerald-400">$10,000.00 USDT</div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-slate-300 font-medium text-[9px] sm:text-[11px]">Simulated PnL</span>
                <span className="font-mono font-bold text-emerald-400">
                  +$2,450.00 (+24.5%)
                </span>
              </div>
            </div>

            <div className="absolute -bottom-1 -left-1 sm:bottom-2 sm:left-2 z-20 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-emerald-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <RefreshCw className="w-3 h-3 text-emerald-200 animate-spin" />
              <span>1-Click Refill</span>
            </div>
          </div>
        );

      case 'copy':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-purple-500/20 blur-2xl animate-pulse" />

            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-purple-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl space-y-1.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2">
                <span className="text-[10px] sm:text-xs font-bold text-purple-300 flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                  Top Master Traders
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  Auto-Sync
                </span>
              </div>

              <div className="space-y-1 sm:space-y-2">
                {[
                  { name: 'AlphaWhale_Pro', copiers: '1,420', return: '+412%' }
                ].map((trader, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white">
                        {trader.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white text-[10px] sm:text-[11px]">{trader.name}</div>
                        <div className="text-[8px] sm:text-[9px] text-slate-400">{trader.copiers} copiers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs font-mono font-black text-emerald-400">{trader.return}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-1 -left-1 sm:top-2 sm:left-2 z-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-purple-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
              <span>Profit Share</span>
            </div>
          </div>
        );

      case 'markets':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-sky-500/20 blur-2xl animate-pulse" />

            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-sky-500/30 rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-2xl backdrop-blur-xl space-y-1.5 sm:space-y-2.5">
              <div className="text-[10px] sm:text-xs font-bold text-sky-300 flex items-center justify-between border-b border-white/10 pb-1 sm:pb-2">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
                  Unified Feeds
                </span>
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-mono">24/7</span>
              </div>

              <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
                {[
                  { symbol: 'BTC/USDT', price: '$68,420', change: '+3.4%', green: true },
                  { symbol: 'XAU/USD', price: '$2,410', change: '+0.8%', green: true },
                ].map((m, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-300">{m.symbol}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-[9px] sm:text-[11px] font-bold text-white">{m.price}</span>
                      <span className={`text-[8px] sm:text-[9px] font-bold ${m.green ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-1 -right-1 sm:bottom-2 sm:right-2 z-20 bg-sky-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-sky-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <BarChart2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-200" />
              <span>100+ Assets</span>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />

            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl space-y-1.5 sm:space-y-3 text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full bg-slate-950 rounded-lg sm:rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />
                </div>
              </div>

              <div>
                <div className="text-[10px] sm:text-xs font-black text-white">Bank-Grade Multi-Sig</div>
                <div className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">100% Cold Storage Backup</div>
              </div>
            </div>

            <div className="absolute -top-1 -right-1 sm:top-2 sm:right-2 z-20 bg-cyan-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-cyan-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-200" />
              <span>Proof of Reserves</span>
            </div>
          </div>
        );

      case 'academy':
        return (
          <div className="relative w-full h-28 sm:h-56 lg:h-64 flex items-center justify-center p-1 sm:p-2">
            <div className="absolute w-28 h-28 sm:w-48 sm:h-48 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />

            <div className="relative z-10 w-full max-w-[220px] sm:max-w-[320px] bg-slate-900/90 border border-indigo-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl space-y-1.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2">
                <span className="text-[10px] sm:text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
                  Master Skills
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded-full">
                  Level 3 Learner
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] sm:text-[10px] font-bold mb-0.5 sm:mb-1">
                    <span className="text-slate-300">Technical Analysis 101</span>
                    <span className="text-indigo-400">85%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[85%]" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-between text-[9px] sm:text-[10px]">
                  <span className="text-slate-300 font-medium truncate mr-1">Risk Management</span>
                  <span className="text-emerald-400 font-bold shrink-0">+500 XP</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-1 -left-1 sm:bottom-2 sm:left-2 z-20 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg border border-indigo-300/30 flex items-center gap-1 scale-90 sm:scale-100">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
              <span>Interactive Lessons</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={carouselRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (isDragging) {
          handleMouseUp();
        } else {
          setIsPaused(false);
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${currentSlide.gradient} text-white border shadow-2xl transition-colors duration-700 outline-none select-none cursor-grab active:cursor-grabbing`}
      aria-label="Promotional Carousel"
    >
      {/* Background Subtle Glows */}
      <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 sm:w-96 sm:h-96 ${currentSlide.accentGlow} rounded-full blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700`} />
      <div className={`absolute bottom-0 left-1/3 -mb-10 w-40 h-40 sm:w-80 sm:h-80 ${currentSlide.accentGlow} rounded-full blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700`} />

      {/* Decorative Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Slide Content with AnimatePresence */}
      <div className="relative z-10 p-3.5 sm:p-8 lg:p-10 flex flex-col justify-between">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentSlide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-6 items-center"
          >
            {/* Left Text Content (7 cols on Desktop) */}
            <div className="lg:col-span-7 space-y-1.5 sm:space-y-4 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 border border-white/20 text-white text-[9px] sm:text-[11px] font-bold backdrop-blur-md shadow-sm">
                <BadgeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span className="tracking-wider uppercase">{currentSlide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-3xl lg:text-5xl font-black tracking-tight leading-snug sm:leading-tight text-white">
                {currentSlide.heading}
              </h1>

              {/* Description */}
              <p className="text-[11px] sm:text-sm lg:text-base text-slate-300 font-medium max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentSlide.description}
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-1 sm:pt-2">
                <button
                  onClick={() => onNavigate(currentSlide.primaryBtnTab)}
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-[11px] sm:text-sm shadow-md sm:shadow-xl shadow-accent/30 hover:shadow-accent/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentSlide.primaryBtnText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {currentSlide.secondaryBtnText && currentSlide.secondaryBtnTab && (
                  <button
                    onClick={() => onNavigate(currentSlide.secondaryBtnTab!)}
                    className="hidden sm:flex px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all items-center gap-2 cursor-pointer"
                  >
                    <span>{currentSlide.secondaryBtnText}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Right Graphic Illustration (5 cols on Desktop) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              {renderGraphic(currentSlide.graphicType)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots Bar (Bottom of Hero Card) */}
        <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t border-white/10 flex items-center justify-start">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === index
                    ? 'w-5 sm:w-8 bg-accent shadow-md shadow-accent/50'
                    : 'w-1.5 sm:w-2.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
