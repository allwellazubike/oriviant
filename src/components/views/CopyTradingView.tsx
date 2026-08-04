import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquarePlus,
  ArrowUpRight
} from 'lucide-react';
import { useCopyTrading } from '../../contexts/CopyTradingContext';
import { LeadTrader } from '../../types';

export const CopyTradingView: React.FC = () => {
  const { traders, followedTraders, followTrader, stopCopyTrader, addReview } = useCopyTrading();

  const [filterSort, setFilterSort] = useState<'roi' | 'winrate' | 'risk' | 'followers'>('roi');
  const [selectedTrader, setSelectedTrader] = useState<LeadTrader | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyAllocation, setCopyAllocation] = useState<number>(1000);
  const [stopLossPct, setStopLossPct] = useState<number>(15);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');

  const sortedTraders = [...traders].sort((a, b) => {
    if (filterSort === 'roi') return b.roi30d - a.roi30d;
    if (filterSort === 'winrate') return b.winRate - a.winRate;
    if (filterSort === 'risk') return a.riskScore - b.riskScore;
    return b.followers - a.followers;
  });

  const handleConfirmCopy = () => {
    if (selectedTrader) {
      followTrader(selectedTrader.id, copyAllocation, stopLossPct);
      setIsCopyModalOpen(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrader && reviewComment) {
      addReview(selectedTrader.id, reviewRating, reviewComment);
      setIsReviewModalOpen(false);
      setReviewComment('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              PRO COPY TRADING ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Copy Professional Traders 1:1</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Automatically mirror trades placed by verified lead traders with transparent performance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] text-slate-300 block">Total Copied</span>
            <span className="text-lg font-black text-emerald-400">${Object.keys(followedTraders).length * 5000} USDT</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-app">
        {[
          { id: 'roi', label: '★ Highest 30D ROI' },
          { id: 'winrate', label: 'Highest Win Rate' },
          { id: 'risk', label: 'Lowest Risk Score' },
          { id: 'followers', label: 'Most Followed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterSort(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterSort === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'bg-app-card text-app-sec hover:text-app border border-app'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lead Traders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTraders.map((trader) => {
          const isFollowing = !!followedTraders[trader.id];

          return (
            <div
              key={trader.id}
              className="p-5 rounded-2xl bg-app-card border border-app hover:border-accent/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Profile Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={trader.avatar}
                      alt={trader.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-extrabold text-sm text-app">{trader.name}</h3>
                        {trader.verified && <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-app-sec">Risk Score {trader.riskScore}/10</span>
                        <span className="text-app-sec">•</span>
                        <span className="text-[10px] text-app-sec">{trader.followers}/{trader.maxFollowers} Copiers</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    +{trader.roi30d}% 30D
                  </span>
                </div>

                <p className="text-xs text-app-sec mt-3 line-clamp-2 leading-relaxed">
                  {trader.description}
                </p>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-app-sec/60 border border-app my-3 text-center">
                  <div>
                    <span className="text-[10px] text-app-sec block">Win Rate</span>
                    <span className="text-xs font-bold text-app">{trader.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-sec block">7D ROI</span>
                    <span className="text-xs font-bold text-positive">+{trader.roi7d}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-sec block">AUM</span>
                    <span className="text-xs font-bold text-app">${(trader.aum / 1e6).toFixed(2)}M</span>
                  </div>
                </div>

                {/* Copier Reviews Snippet */}
                {trader.reviews.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-app-sec/30 border border-app text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-app text-[11px] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {trader.reviews[0].copierName}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold">Verified Copier</span>
                    </div>
                    <p className="text-app-sec text-[11px] italic">"{trader.reviews[0].comment}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {isFollowing ? (
                  <button
                    onClick={() => stopCopyTrader(trader.id)}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-colors"
                  >
                    Stop Copying
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedTrader(trader);
                      setIsCopyModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md shadow-accent/20 transition-all"
                  >
                    Copy Trader
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTrader(trader);
                    setIsReviewModalOpen(true);
                  }}
                  title="Write Review for Lead Trader"
                  className="p-2.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
                >
                  <MessageSquarePlus className="w-4 h-4 text-accent" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Copy Settings Modal */}
      {isCopyModalOpen && selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-app">Copy Setup — {selectedTrader.name}</h3>
              <button onClick={() => setIsCopyModalOpen(false)}>
                <X className="w-5 h-5 text-app-sec" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">
                Copy Capital Allocation (USDT)
              </label>
              <input
                type="number"
                value={copyAllocation}
                onChange={(e) => setCopyAllocation(parseFloat(e.target.value) || 0)}
                className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-sec mb-1">
                Automated Stop-Copy Loss Threshold ({stopLossPct}%)
              </label>
              <input
                type="range"
                min={5}
                max={50}
                value={stopLossPct}
                onChange={(e) => setStopLossPct(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <button
              onClick={handleConfirmCopy}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Confirm & Start Copying ${copyAllocation} USDT
            </button>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-app">Write Review for {selectedTrader.name}</h3>
              <button onClick={() => setIsReviewModalOpen(false)}>
                <X className="w-5 h-5 text-app-sec" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Star Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-app-sec'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Your Copier Experience</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on risk management, drawdown, and ROI performance..."
                  className="w-full bg-app-sec border border-app rounded-xl p-3 text-xs text-app focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-lg"
              >
                Submit Copier Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
