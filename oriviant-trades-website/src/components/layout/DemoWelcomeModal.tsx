import React from 'react';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { useDemoMode } from '../../contexts/DemoModeContext';

export const DemoWelcomeModal: React.FC = () => {
  const { showWelcomeModal, dismissWelcomeModal } = useDemoMode();

  if (!showWelcomeModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-app-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>Virtual Trading Account</span>
          </div>
          <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            🟢 DEMO MODE
          </span>
        </div>

        {/* Title & Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-app tracking-tight">
            Welcome to Demo Trading
          </h2>
          <p className="text-xs sm:text-sm text-app-sec leading-relaxed">
            Practice with virtual funds using real market prices. No real money is involved. Build confidence before switching to Live Trading.
          </p>
        </div>

        {/* Core Value Pillars */}
        <div className="space-y-3 bg-app-sec/40 p-4 rounded-2xl border border-app">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-app">10,000 USDT Virtual Balance</p>
              <p className="text-[11px] text-app-sec">Refill or reset anytime back to $10,000 USDT instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-app">Real-time Live Market Rates</p>
              <p className="text-[11px] text-app-sec">Order books, candlestick charts, and tickers reflect real market speed.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-app">100% Risk-Free Practice</p>
              <p className="text-[11px] text-app-sec">Test spot, futures leverage, and copy trading without risking capital.</p>
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <button
          onClick={dismissWelcomeModal}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Trading</span>
        </button>

      </div>
    </div>
  );
};
