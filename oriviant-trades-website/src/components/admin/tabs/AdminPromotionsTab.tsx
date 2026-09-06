import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  Trophy, 
  Percent, 
  Users, 
  Tag, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Trash2,
  Calendar
} from 'lucide-react';

export interface PromotionItem {
  id: string;
  name: string;
  type: 'Trading Competitions' | 'Referral Campaigns' | 'Deposit Bonuses' | 'Trading Bonuses' | 'Coupon Codes' | 'Promotional Banners';
  rewardPool: string;
  code?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Paused';
  participantsCount: number;
}

export const AdminPromotionsTab: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([
    {
      id: 'PROMO-001',
      name: 'Summer Futures Trading Grand Prix',
      type: 'Trading Competitions',
      rewardPool: '$250,000 USDT',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'Active',
      participantsCount: 14210
    },
    {
      id: 'PROMO-002',
      name: 'First Deposit 100% Margin Match',
      type: 'Deposit Bonuses',
      rewardPool: '$500 Max Bonus',
      code: 'WELCOME500',
      startDate: '2026-07-15',
      endDate: '2026-09-15',
      status: 'Active',
      participantsCount: 8940
    },
    {
      id: 'PROMO-003',
      name: 'Affiliate Tier 1 Commission Multiplier (45%)',
      type: 'Referral Campaigns',
      rewardPool: '45% Fee Share',
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      status: 'Active',
      participantsCount: 1240
    },
    {
      id: 'PROMO-004',
      name: 'Copy Trading Lead Trader Booster',
      type: 'Trading Bonuses',
      rewardPool: '$5,000 AUM Grant',
      startDate: '2026-08-10',
      endDate: '2026-08-25',
      status: 'Upcoming',
      participantsCount: 0
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<PromotionItem['type']>('Trading Competitions');
  const [rewardPool, setRewardPool] = useState('');
  const [code, setCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rewardPool) return;

    const newPromo: PromotionItem = {
      id: `PROMO-${Date.now().toString().slice(-3)}`,
      name,
      type,
      rewardPool,
      code: code || undefined,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-12-31',
      status: 'Active',
      participantsCount: 0
    };

    setPromotions([newPromo, ...promotions]);
    setIsModalOpen(false);
    setName('');
    setRewardPool('');
    setCode('');
    showToast(`Campaign "${name}" created and launched!`);
  };

  const handleDelete = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    showToast('Promotion campaign deleted.');
  };

  const toggleStatus = (id: string) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === id) {
        const next = p.status === 'Active' ? 'Paused' : 'Active';
        return { ...p, status: next };
      }
      return p;
    }));
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

      {/* Control Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <span>Promotions & Trading Campaign Manager</span>
          </h2>
          <p className="text-xs text-app-sec">Create referral bonuses, deposit matches, coupon codes, and trading grand prix competitions.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Promotion</span>
        </button>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((p) => (
          <div key={p.id} className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-3 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {p.type}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(p.id)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-app-sec text-app-sec'
                    }`}
                  >
                    {p.status}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-app-sec hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-app">{p.name}</h3>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="p-2 rounded-xl bg-app-sec/40 border border-app font-mono font-bold text-emerald-500">
                  Pool: {p.rewardPool}
                </div>
                {p.code && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono font-black">
                    Code: {p.code}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-app flex items-center justify-between text-[11px] text-app-sec font-mono">
              <div>Participants: <strong className="text-app">{p.participantsCount.toLocaleString()}</strong></div>
              <div>Duration: <strong className="text-app-sec">{p.startDate} - {p.endDate}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Create New Promotional Campaign</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-app-sec mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autumn Spot Trading Competition"
                  required
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Campaign Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                  >
                    <option value="Trading Competitions">Trading Competitions</option>
                    <option value="Referral Campaigns">Referral Campaigns</option>
                    <option value="Deposit Bonuses">Deposit Bonuses</option>
                    <option value="Trading Bonuses">Trading Bonuses</option>
                    <option value="Coupon Codes">Coupon Codes</option>
                    <option value="Promotional Banners">Promotional Banners</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Reward Pool / Grant</label>
                  <input
                    type="text"
                    value={rewardPool}
                    onChange={(e) => setRewardPool(e.target.value)}
                    placeholder="$100,000 USDT"
                    required
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-app-sec mb-1">Coupon Code (Optional)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="PROMO2026"
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app"
                  />
                </div>
                <div>
                  <label className="block font-bold text-app-sec mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md"
                >
                  Launch Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
