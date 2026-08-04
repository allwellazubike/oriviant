import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Award, 
  History, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Target,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { NavigationTab } from '../../types';
import { ResetDemoBalanceModal } from '../layout/ResetDemoBalanceModal';

interface DemoWorkspaceViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DemoWorkspaceView: React.FC<DemoWorkspaceViewProps> = ({ onNavigate }) => {
  const { demoBalance, refillDemoFunds, virtualLedger, analytics } = useDemoMode();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <ResetDemoBalanceModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
      
      {/* Workspace Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              🟢 DEMO ACCOUNT - VIRTUAL SIMULATOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Demo Trading Environment</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Practice spot, futures leverage, and copy trading risk-free with virtual funds. Real orderbooks with live market price feed.
          </p>
        </div>

        {/* Refill Quick Buttons & Reset Balance */}
        <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md space-y-3 shrink-0">
          <div className="text-xs text-slate-300">
            Available Virtual Balance:
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => refillDemoFunds(5000)}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              +$5k
            </button>
            <button
              onClick={() => refillDemoFunds(10000)}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              +$10k
            </button>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 10,000 USDT</span>
            </button>
          </div>
        </div>

      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-app-sec">
            <span>Win Rate</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{analytics.winRate}%</div>
          <div className="flex items-center justify-between text-[10px] text-app-sec pt-1 border-t border-app/60">
            <span className="flex items-center gap-1 text-emerald-500 font-bold"><CheckCircle2 className="w-3 h-3" /> {analytics.winningTrades} Wins</span>
            <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle className="w-3 h-3" /> {analytics.losingTrades} Losses</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-app-sec">
            <span>Total Net Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black ${analytics.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {analytics.totalProfit >= 0 ? '+' : ''}${analytics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-app-sec pt-1 border-t border-app/60 font-mono">Profit Factor: <strong className="text-app">{analytics.profitFactor}</strong></p>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-app-sec">
            <span>Streaks Performance</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            {analytics.currentStreak > 0 ? `+${analytics.currentStreak} Wins` : `${analytics.currentStreak} Losses`}
          </div>
          <p className="text-[10px] text-app-sec pt-1 border-t border-app/60">
            Max Win Streak: <strong className="text-emerald-500">+{analytics.maxWinStreak}</strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-app-sec">
            <span>Total Simulated Trades</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-app">{analytics.totalTradesCount}</div>
          <p className="text-[10px] text-emerald-500 pt-1 border-t border-app/60 font-bold">100% Risk-Free Virtual Funds</p>
        </div>

      </div>

      {/* Virtual Ledger Table */}
      <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app pb-3">
          <h3 className="text-sm font-bold text-app flex items-center gap-2">
            <History className="w-4 h-4 text-accent" />
            Virtual Ledger Transaction History
          </h3>
          <span className="text-xs text-app-sec">Audit log of refills, resets, trades, and fees</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2.5">Date & Time</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs font-medium">
              {virtualLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-app-sec/40 transition-colors">
                  <td className="py-3 text-app-sec">{entry.timestamp}</td>
                  <td className="py-3 uppercase font-bold text-app">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      entry.type === 'refill' ? 'bg-blue-500/10 text-blue-500' :
                      entry.type === 'trade_profit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-3 text-app">{entry.description}</td>
                  <td className={`py-3 text-right font-extrabold ${entry.amount >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {entry.amount >= 0 ? '+' : ''}${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right text-app font-bold font-mono">
                    ${entry.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transition CTA */}
      <div className="p-6 rounded-2xl bg-app-sec border border-app flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-app">Ready to execute on Live Markets?</h4>
          <p className="text-xs text-app-sec">Switch anytime from the header pill toggle or jump straight to Spot.</p>
        </div>
        <button
          onClick={() => onNavigate('spot')}
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Trade Spot Markets</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
