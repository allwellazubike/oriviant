import React, { useState } from 'react';
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Pin, 
  ShieldAlert, 
  ThumbsUp, 
  Filter
} from 'lucide-react';
import { useCopyTrading } from '../../../contexts/CopyTradingContext';

interface AdminReviewItem {
  id: string;
  copierName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Featured' | 'Hidden';
  traderName: string;
}

export const AdminReviewsTab: React.FC = () => {
  const { traders } = useCopyTrading();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [reviewsList, setReviewsList] = useState<AdminReviewItem[]>([
    { id: 'r1', copierName: 'Michael_B', rating: 5, comment: 'Incredible return on investment copying AlphaQuant! +32% profit in my first 2 weeks.', date: '2026-08-01', status: 'Featured', traderName: 'AlphaQuant' },
    { id: 'r2', copierName: 'CryptoRider', rating: 5, comment: 'Extremely clean risk management and stop losses. Best copy trading system on the market.', date: '2026-08-03', status: 'Approved', traderName: 'Satoshi_Master' },
    { id: 'r3', copierName: 'AnonUser99', rating: 1, comment: 'FREE CRYPTO AIRDROP CLICK HERE bit.ly/fake-spam-link-claim-now', date: '2026-08-04', status: 'Pending', traderName: 'GlobalTrader' },
    { id: 'r4', copierName: 'Elena_K', rating: 4, comment: 'Smooth execution on futures trades. Highly recommended.', date: '2026-08-02', status: 'Approved', traderName: 'AlphaQuant' },
  ]);

  const [filterStatus, setFilterStatus] = useState<'All' | 'Featured' | 'Approved' | 'Pending' | 'Hidden'>('All');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApprove = (id: string) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    showToast('Review approved and published on platform.');
  };

  const handleTogglePinFeatured = (id: string) => {
    setReviewsList(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'Featured' ? 'Approved' : 'Featured';
        showToast(nextStatus === 'Featured' ? 'Pinned review to featured spotlight!' : 'Unpinned review.');
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleHideSpam = (id: string) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, status: 'Hidden' } : r));
    showToast('Review hidden from public feed.');
  };

  const handleDelete = (id: string) => {
    setReviewsList(prev => prev.filter(r => r.id !== id));
    showToast('Review deleted permanently.');
  };

  const filtered = reviewsList.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex items-center justify-between gap-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span>Reviews Moderation Suite</span>
        </h3>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Featured', 'Approved', 'Pending', 'Hidden'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterStatus === st ? 'bg-amber-500 text-white shadow-sm' : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((rev) => (
          <div key={rev.id} className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs text-app">{rev.copierName}</span>
                <span className="text-xs text-app-sec">reviewed</span>
                <span className="font-bold text-xs text-amber-500">@{rev.traderName}</span>

                <div className="flex items-center text-amber-400 gap-0.5 ml-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-app-sec'}`} />
                  ))}
                </div>

                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold ${
                  rev.status === 'Featured' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                  rev.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  rev.status === 'Pending' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {rev.status}
                </span>
              </div>

              <p className="text-xs text-app font-medium bg-app-sec/40 p-3 rounded-2xl border border-app">
                "{rev.comment}"
              </p>

              <p className="text-[10px] text-app-sec font-mono">{rev.date}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {rev.status === 'Pending' && (
                <button
                  onClick={() => handleApprove(rev.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              )}

              <button
                onClick={() => handleTogglePinFeatured(rev.id)}
                className={`p-2 rounded-xl transition-colors ${
                  rev.status === 'Featured' ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                }`}
                title="Pin Featured Review"
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleHideSpam(rev.id)}
                className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                title="Hide / Flag Review"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(rev.id)}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                title="Delete Permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
