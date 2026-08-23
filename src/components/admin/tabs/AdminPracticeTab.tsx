import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  TrendingUp, 
  Users, 
  Award, 
  BarChart3, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  ArrowUpRight,
  RefreshCw,
  PieChart,
  Layers,
  Sparkles
} from 'lucide-react';
import { useDemoMode } from '../../../contexts/DemoModeContext';

export const AdminPracticeTab: React.FC = () => {
  const { demoBalance, setDemoBalanceDirect, resetDemoBalance, analytics } = useDemoMode();

  const [defaultBalanceInput, setDefaultBalanceInput] = useState('10000');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Simulated Practice Mode Users in Admin Directory
  const [practiceUsers, setPracticeUsers] = useState([
    { id: 'usr-demo-01', name: 'Alex Vance (Current)', email: 'alex.v@oriviant.io', virtualBalance: demoBalance, winRate: analytics.winRate, totalTrades: analytics.totalTradesCount, volume: 145200, status: 'Active' },
    { id: 'usr-demo-02', name: 'Elena Rostova', email: 'elena.r@fintech.de', virtualBalance: 24850.00, winRate: 82.4, totalTrades: 94, volume: 580000, status: 'Active' },
    { id: 'usr-demo-03', name: 'Marcus Chen', email: 'm.chen@quant.singapore', virtualBalance: 18920.50, winRate: 76.2, totalTrades: 62, volume: 310500, status: 'Active' },
    { id: 'usr-demo-04', name: 'Sophia Sterling', email: 's.sterling@capital.uk', virtualBalance: 9120.00, winRate: 58.3, totalTrades: 28, volume: 92000, status: 'Active' },
    { id: 'usr-demo-05', name: 'Dmitri Petrov', email: 'dmitri.p@crypto.ru', virtualBalance: 4200.00, winRate: 41.0, totalTrades: 45, volume: 180000, status: 'Reset Needed' },
  ]);

  // Most Traded Assets in Practice Mode
  const mostTradedAssets = [
    { symbol: 'BTC/USDT', name: 'Bitcoin Perpetual', volumeShare: '42.5%', trades: 14200, trend: '+18.4%' },
    { symbol: 'ETH/USDT', name: 'Ethereum Perpetual', volumeShare: '24.1%', trades: 8900, trend: '+12.1%' },
    { symbol: 'SOL/USDT', name: 'Solana Spot', volumeShare: '11.8%', trades: 4300, trend: '+35.6%' },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar FX', volumeShare: '8.2%', trades: 2800, trend: '+4.2%' },
    { symbol: 'XAU/USD', name: 'Gold Spot Bullion', volumeShare: '6.4%', trades: 2100, trend: '+8.9%' },
    { symbol: 'NVDA', name: 'Nvidia Corp Stock', volumeShare: '4.0%', trades: 1400, trend: '+22.0%' },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateDefaultBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(defaultBalanceInput);
    if (isNaN(val) || val <= 0) return;
    setDemoBalanceDirect(val);
    triggerToast(`Updated default Practice Balance to $${val.toLocaleString()} USDT!`);
  };

  const handleResetUserAccount = (userId: string, userName: string) => {
    if (userId === 'usr-demo-01') {
      resetDemoBalance();
    }
    setPracticeUsers(prev => prev.map(u => u.id === userId ? { ...u, virtualBalance: 10000, status: 'Reset to 10k' } : u));
    triggerToast(`Reset ${userName}'s Practice Balance back to 10,000 USDT.`);
  };

  const filteredUsers = practiceUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-250">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-app-sec hover:text-app">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              PRACTICE MODE EXECUTIVE DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Practice Mode & Trading Simulator Management</h1>
          <p className="text-xs text-slate-300">
            Monitor virtual trading activity, modify default balances, audit practice accounts, and track leaderboard top performers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-right">
            <span className="text-[10px] text-slate-300 block font-bold uppercase">Total Practice Volume (24H)</span>
            <span className="text-2xl font-black text-amber-400 font-mono">$18.4M USDT</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-app-card border border-app space-y-1">
          <span className="text-xs font-semibold text-app-sec block">Active Practice Users</span>
          <div className="text-2xl font-black text-app">14,280</div>
          <span className="text-[10px] text-emerald-500 font-bold">+12.4% this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app space-y-1">
          <span className="text-xs font-semibold text-app-sec block">Default Practice Balance</span>
          <div className="text-2xl font-black text-amber-500 font-mono">$10,000 USDT</div>
          <span className="text-[10px] text-app-sec font-medium">Auto-assigned on registration</span>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app space-y-1">
          <span className="text-xs font-semibold text-app-sec block">Average Practice Win Rate</span>
          <div className="text-2xl font-black text-emerald-500">64.8%</div>
          <span className="text-[10px] text-app-sec font-medium">Across 850k simulated orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app space-y-1">
          <span className="text-xs font-semibold text-app-sec block">Account Reset Frequency</span>
          <div className="text-2xl font-black text-indigo-400">1.2 / User / Mo</div>
          <span className="text-[10px] text-app-sec font-medium">100% Risk-Free Virtual Funds</span>
        </div>
      </div>

      {/* Controls & Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Change Default Practice Balance Form */}
        <div className="p-6 rounded-2xl bg-app-card border border-app space-y-4">
          <h3 className="text-sm font-bold text-app flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Default Practice Balance Config</span>
          </h3>
          <p className="text-xs text-app-sec leading-relaxed">
            Set the default starting virtual USDT allocation assigned to new users when opening Practice Mode.
          </p>

          <form onSubmit={handleUpdateDefaultBalance} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">Default Balance (USDT)</label>
              <input
                type="number"
                value={defaultBalanceInput}
                onChange={(e) => setDefaultBalanceInput(e.target.value)}
                className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Default Allocation</span>
            </button>
          </form>
        </div>

        {/* Most Traded Assets in Practice Mode */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-app-card border border-app space-y-4">
          <div className="flex items-center justify-between border-b border-app pb-3">
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <span>Most Traded Assets in Practice Mode</span>
            </h3>
            <span className="text-xs text-app-sec">Live Simulator Analytics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mostTradedAssets.map((asset) => (
              <div key={asset.symbol} className="p-3.5 rounded-xl bg-app-sec/40 border border-app/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-app">{asset.symbol}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">{asset.trend}</span>
                </div>
                <div className="text-[10px] text-app-sec">{asset.name}</div>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-app/40">
                  <span className="text-app-sec">Share: <strong className="text-app">{asset.volumeShare}</strong></span>
                  <span className="text-app-sec">Orders: <strong className="text-app">{asset.trades}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Practice Users Directory & Reset Accounts Table */}
      <div className="p-6 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app pb-4">
          <div>
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Practice Accounts Monitor & Reset Directory</span>
            </h3>
            <p className="text-xs text-app-sec">View virtual balances, win rates, and trigger manual account resets.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-app-sec absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-app-sec border border-app rounded-xl pl-9 pr-3 py-1.5 text-xs text-app"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2.5">User Details</th>
                <th className="py-2.5 text-right">Virtual Balance</th>
                <th className="py-2.5 text-right">Win Rate</th>
                <th className="py-2.5 text-right">Simulated Trades</th>
                <th className="py-2.5 text-right">Volume</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs font-medium">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-app-sec/40 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-app block">{user.name}</span>
                    <span className="text-[10px] text-app-sec">{user.email}</span>
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-500 font-mono">
                    ${user.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                  </td>
                  <td className="py-3 text-right font-bold text-app">
                    {user.winRate}%
                  </td>
                  <td className="py-3 text-right text-app font-mono">
                    {user.totalTrades}
                  </td>
                  <td className="py-3 text-right text-app font-mono">
                    ${user.volume.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleResetUserAccount(user.id, user.name)}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs border border-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset 10k Balance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice Leaderboard */}
      <div className="p-6 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-app pb-3">
          <h3 className="text-sm font-bold text-app flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Practice Mode Top Leaderboard</span>
          </h3>
          <span className="text-xs text-app-sec">Ranked by Virtual ROI %</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { rank: 1, name: 'Elena Rostova', roi: '+148.5%', pnl: '+$14,850 USDT', winRate: '82.4%', badge: '🥇 1st Place' },
            { rank: 2, name: 'Marcus Chen', roi: '+89.2%', pnl: '+$8,920 USDT', winRate: '76.2%', badge: '🥈 2nd Place' },
            { rank: 3, name: 'Alex Vance', roi: '+34.5%', pnl: '+$3,450 USDT', winRate: '75.0%', badge: '🥉 3rd Place' },
          ].map((trader) => (
            <div key={trader.rank} className="p-4 rounded-2xl bg-app-sec/40 border border-app/60 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-500">{trader.badge}</span>
                <span className="text-xs font-bold text-emerald-500 font-mono">{trader.roi}</span>
              </div>
              <div className="font-extrabold text-sm text-app">{trader.name}</div>
              <div className="flex items-center justify-between text-xs text-app-sec pt-2 border-t border-app/40 font-mono">
                <span>Profit: <strong className="text-emerald-500">{trader.pnl}</strong></span>
                <span>Win Rate: <strong className="text-app">{trader.winRate}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
