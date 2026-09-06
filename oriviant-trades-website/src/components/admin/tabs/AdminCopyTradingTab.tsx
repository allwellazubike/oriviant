import React, { useState } from 'react';
import { 
  UserCheck, 
  Check, 
  X, 
  Ban, 
  Award, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCopyTrading } from '../../../contexts/CopyTradingContext';

export const AdminCopyTradingTab: React.FC = () => {
  const { traders } = useCopyTrading();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Additional pending trader applications
  const [pendingApps, setPendingApps] = useState([
    { id: 'p1', name: 'Satoshi_Whale', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', roi30d: 214.5, winRate: 88, riskScore: 3, aum: '$450,000' },
    { id: 'p2', name: 'AlphaQuant_Desk', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', roi30d: 142.0, winRate: 82, riskScore: 4, aum: '$890,000' },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApproveApp = (id: string, name: string) => {
    setPendingApps(prev => prev.filter(p => p.id !== id));
    showToast(`Approved Lead Trader application for ${name}! Added to official copy rank.`);
  };

  const handleRejectApp = (id: string, name: string) => {
    setPendingApps(prev => prev.filter(p => p.id !== id));
    showToast(`Rejected Lead Trader application for ${name}.`);
  };

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
        </div>

        {pendingApps.length === 0 ? (
          <div className="p-4 rounded-2xl bg-app-sec/30 border border-app text-center text-xs text-app-sec">
            No pending Lead Trader applications awaiting review.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl bg-app-sec/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={app.avatar} alt={app.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-app">{app.name}</h4>
                    <p className="text-[11px] text-app-sec mt-0.5">
                      30D ROI: <strong className="text-emerald-500">+{app.roi30d}%</strong> • Win Rate: <strong>{app.winRate}%</strong> • Risk: <strong>{app.riskScore}/10</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveApp(app.id, app.name)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve Lead Trader
                  </button>

                  <button
                    onClick={() => handleRejectApp(app.id, app.name)}
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
          <span>Active Lead Traders & Copier Rankings ({traders.length} Active)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traders.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl bg-app-sec/30 border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-accent/30" />
                  <div>
                    <h4 className="text-xs font-black text-app">{t.name}</h4>
                    <span className="text-[10px] text-app-sec">Copiers: {t.copiersCount} / {t.maxCopiers}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-500/10 text-emerald-500">
                  Active Trader
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-app/60 font-mono">
                <div>
                  <span className="text-app-sec block text-[9px] uppercase">30D ROI</span>
                  <span className="font-extrabold text-emerald-500">+{t.roi30d}%</span>
                </div>

                <div>
                  <span className="text-app-sec block text-[9px] uppercase">Win Rate</span>
                  <span className="font-extrabold text-app">{t.winRate}%</span>
                </div>

                <div>
                  <span className="text-app-sec block text-[9px] uppercase">Risk Score</span>
                  <span className="font-extrabold text-amber-500">{t.riskScore}/10</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-app/60 text-xs">
                <span className="text-[11px] text-app-sec font-medium">AUM: <strong className="text-app">${t.aum.toLocaleString()} USDT</strong></span>

                <button
                  onClick={() => showToast(`Suspended Lead Trader privileges for ${t.name}.`)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs"
                >
                  Suspend Trader
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
