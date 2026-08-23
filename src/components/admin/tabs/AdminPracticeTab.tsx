import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  RefreshCw,
  Trophy,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface PracticeAccount {
  user_id: number;
  email: string;
  nickname: string;
  balance: string;
  starting_balance: string;
  total_trades: number;
  last_reset_at: string;
  updated_at: string;
}

interface LeaderboardRow {
  user_id: number;
  email: string;
  nickname: string;
  balance: string;
  starting_balance: string;
  total_trades: number;
  pnl: string;
}

export const AdminPracticeTab: React.FC = () => {
  const [accounts, setAccounts] = useState<PracticeAccount[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState<number | 'ALL' | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [accRes, lbRes] = await Promise.all([
        adminApi.getPracticeAccounts(),
        adminApi.getPracticeLeaderboard()
      ]);
      if (accRes.success) setAccounts(accRes.data);
      if (lbRes.success) setLeaderboard(lbRes.data);
    } catch (error) {
      console.error('Failed to load practice mode data:', error);
      showToast('Error loading practice mode data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetOne = async (userId: number, label: string) => {
    setPendingReset(userId);
    try {
      await adminApi.resetPracticeAccount(userId);
      showToast(`Reset ${label}'s practice balance to $10,000 USDT.`);
      await fetchData();
    } catch (error) {
      showToast('Failed to reset account.');
    } finally {
      setPendingReset(null);
    }
  };

  const handleResetAll = async () => {
    setConfirmResetAll(false);
    setPendingReset('ALL');
    try {
      const res = await adminApi.resetAllPracticeAccounts();
      showToast(res.message || `Reset ${res.data?.count ?? 0} practice accounts.`);
      await fetchData();
    } catch (error) {
      showToast('Failed to reset all practice accounts.');
    } finally {
      setPendingReset(null);
    }
  };

  const fmtUsd = (v: string | number) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">

      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="p-5 rounded-3xl bg-app-card border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <span>Practice Mode Desk</span>
          </h2>
          <p className="text-xs text-app-sec">Real per-user paper-trading accounts, reported by the client as trades execute.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchData} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setConfirmResetAll(true)}
            disabled={pendingReset === 'ALL'}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold text-xs border border-red-500/20 disabled:opacity-60"
          >
            Reset All Practice Balances
          </button>
        </div>
      </div>

      {/* Reset-All Confirmation */}
      {confirmResetAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-app">Reset every practice account?</h3>
              <p className="text-xs text-app-sec mt-1.5">This sets all {accounts.length} practice accounts back to their $10,000 USDT starting balance. This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmResetAll(false)} className="flex-1 py-2.5 rounded-xl bg-app-sec text-app font-bold text-xs">Cancel</button>
              <button onClick={handleResetAll} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs">Reset All</button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Account Monitor */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <span>Practice Account Monitor ({accounts.length})</span>
        </h3>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center text-app-sec text-xs font-bold">Loading practice accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="py-10 text-center text-app-sec text-xs font-bold">No practice accounts yet — one is created the first time a user makes a practice trade.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">P&L</th>
                  <th className="pb-3">Trades</th>
                  <th className="pb-3">Last Reset</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/60 text-xs font-medium">
                {accounts.map((a) => {
                  const pnl = Number(a.balance) - Number(a.starting_balance);
                  return (
                    <tr key={a.user_id} className="hover:bg-app-sec/30 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-app">{a.nickname || a.email}</div>
                        <div className="text-[10px] text-app-sec">{a.email}</div>
                      </td>
                      <td className="py-3 font-mono font-bold text-app">{fmtUsd(a.balance)}</td>
                      <td className={`py-3 font-mono font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}{fmtUsd(pnl)}
                      </td>
                      <td className="py-3 text-app-sec">{a.total_trades}</td>
                      <td className="py-3 text-app-sec text-[11px]">{new Date(a.last_reset_at).toLocaleDateString()}</td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={() => handleResetOne(a.user_id, a.nickname || a.email)}
                          disabled={pendingReset === a.user_id}
                          className="px-3 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app-sec hover:text-app font-bold text-[11px] disabled:opacity-60"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top Leaderboard */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Practice Mode Top Leaderboard</span>
        </h3>

        <div className="space-y-2">
          {isLoading ? (
            <div className="py-10 text-center text-app-sec text-xs font-bold">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-10 text-center text-app-sec text-xs font-bold">No completed practice trades yet.</div>
          ) : (
            leaderboard.map((row, idx) => (
              <div key={row.user_id} className="p-3.5 rounded-2xl bg-app-sec/30 border border-app flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-500' : idx === 1 ? 'bg-slate-400/20 text-slate-400' : idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-app-sec text-app-sec'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-app text-xs">{row.nickname || row.email}</div>
                    <div className="text-[10px] text-app-sec">{row.total_trades} trades</div>
                  </div>
                </div>
                <span className={`font-mono font-black text-xs ${Number(row.pnl) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Number(row.pnl) >= 0 ? '+' : ''}{fmtUsd(row.pnl)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
