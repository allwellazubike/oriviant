import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Check,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface AdminTrader {
  id: number;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  risk_score: number;
  followers: number;
  max_followers: number;
  aum: number;
  win_rate: number;
  roi_30d: number;
}

export const AdminCopyTradingTab: React.FC = () => {
  const [traders, setTraders] = useState<AdminTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchTraders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCopyTraders();
      if (res.success && Array.isArray(res.data)) {
        setTraders(
          res.data.map((t: any) => ({
            id: t.id,
            handle: t.handle,
            display_name: t.display_name || t.handle,
            avatar_url: t.avatar_url,
            status: t.status,
            risk_score: Number(t.risk_score) || 5,
            followers: Number(t.followers) || 0,
            max_followers: Number(t.max_followers) || 0,
            aum: Number(t.aum) || 0,
            win_rate: Number(t.win_rate) || 0,
            roi_30d: Number(t.roi_30d) || 0
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load lead traders:', error);
      showToast('Error loading lead traders from the database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  const handleSetStatus = async (id: number, name: string, status: string, successMsg: string) => {
    try {
      await adminApi.updateCopyTraderStatus(id, status);
      showToast(successMsg);
      await fetchTraders();
    } catch (error) {
      showToast(`Failed to update status for ${name}.`);
    }
  };

  const pendingApps = traders.filter((t) => t.status === 'pending');
  const activeTraders = traders.filter((t) => t.status === 'active');
  const otherTraders = traders.filter((t) => t.status !== 'pending' && t.status !== 'active');

  return (
    <div className="space-y-6">

      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Pending Applications Queue */}
      <div className="p-5 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Lead Trader Verification Queue ({pendingApps.length} Pending)</span>
          </h3>
          <button onClick={fetchTraders} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-app-sec text-xs font-bold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-accent" />
            Querying Postgres Database...
          </div>
        ) : pendingApps.length === 0 ? (
          <div className="p-4 rounded-2xl bg-app-sec/30 border border-app text-center text-xs text-app-sec">
            No pending Lead Trader applications awaiting review.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl bg-app-sec/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={app.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={app.display_name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-black text-app">{app.display_name}</h4>
                    <p className="text-[11px] text-app-sec mt-0.5">
                      30D ROI: <strong className="text-emerald-500">{app.roi_30d >= 0 ? '+' : ''}{app.roi_30d}%</strong> • Win Rate: <strong>{app.win_rate}%</strong> • Risk: <strong>{app.risk_score}/10</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSetStatus(app.id, app.display_name, 'active', `Approved Lead Trader application for ${app.display_name}! Added to official copy rank.`)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve Lead Trader
                  </button>

                  <button
                    onClick={() => handleSetStatus(app.id, app.display_name, 'rejected', `Rejected Lead Trader application for ${app.display_name}.`)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Lead Traders Management */}
      <div className="p-5 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-accent" />
          <span>Active Lead Traders & Copier Rankings ({activeTraders.length} Active)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTraders.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl bg-app-sec/30 border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={t.display_name}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-accent/30"
                  />
                  <div>
                    <h4 className="text-xs font-black text-app">{t.display_name}</h4>
                    <span className="text-[10px] text-app-sec">Copiers: {t.followers} / {t.max_followers}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-500/10 text-emerald-500">
                  Active Trader
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-app/60 font-mono">
                <div>
                  <span className="text-app-sec block text-[9px] uppercase">30D ROI</span>
                  <span className="font-extrabold text-emerald-500">{t.roi_30d >= 0 ? '+' : ''}{t.roi_30d}%</span>
                </div>

                <div>
                  <span className="text-app-sec block text-[9px] uppercase">Win Rate</span>
                  <span className="font-extrabold text-app">{t.win_rate}%</span>
                </div>

                <div>
                  <span className="text-app-sec block text-[9px] uppercase">Risk Score</span>
                  <span className="font-extrabold text-amber-500">{t.risk_score}/10</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-app/60 text-xs">
                <span className="text-[11px] text-app-sec font-medium">AUM: <strong className="text-app">${t.aum.toLocaleString()} USDT</strong></span>

                <button
                  onClick={() => handleSetStatus(t.id, t.display_name, 'suspended', `Suspended Lead Trader privileges for ${t.display_name}.`)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs"
                >
                  Suspend Trader
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suspended / Rejected Traders */}
      {otherTraders.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-app-sec" />
            <span>Suspended & Rejected Traders ({otherTraders.length})</span>
          </h3>

          <div className="space-y-2">
            {otherTraders.map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-app-sec/30 border border-app flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={t.display_name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-app"
                  />
                  <div>
                    <h4 className="text-xs font-black text-app">{t.display_name}</h4>
                    <span className="text-[10px] text-app-sec uppercase font-bold">{t.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSetStatus(t.id, t.display_name, 'active', `Reinstated ${t.display_name} as an active Lead Trader.`)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs"
                >
                  Reinstate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
