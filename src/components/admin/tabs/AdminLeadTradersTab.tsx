import React, { useState, useEffect } from 'react';
import { useCopyTrading } from '../../../contexts/CopyTradingContext';
import { copyTradingApi } from '../../../api/copyTrading';
import { Users, Plus, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, Loader2, Trash2, Edit2, Zap, X } from 'lucide-react';

export const AdminLeadTradersTab: React.FC = () => {
  const { traders, createLeadTrader, deleteLeadTrader, editLeadTrader } = useCopyTrading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editModeId, setEditModeId] = useState<string | null>(null); 
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // 🔥 State for the Custom Boost Modal
  const [boostModal, setBoostModal] = useState<{isOpen: boolean, subId: number | null, currentAmt: number, inputAmt: string}>({
    isOpen: false, subId: null, currentAmt: 0, inputAmt: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    roi: '',
    winRate: '',
    aum: '',
    followers: '',
    riskScore: '5',
    profitShare: '10',
    strategy: '',
    isVerified: false
  });

  const fetchAllSubscriptions = async () => {
    setLoadingSubs(true);
    try {
      const res = await copyTradingApi.getAllSubscriptions();
      if (res.success && res.data) {
        setSubscriptions(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch subscriptions', e);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const payload: any = {
      name: formData.name,
      handle: formData.handle,
      roi: Number(formData.roi),
      winRate: Number(formData.winRate),
      aum: Number(formData.aum),
      followers: Number(formData.followers),
      riskScore: Number(formData.riskScore),
      profitShare: Number(formData.profitShare),
      strategy: formData.strategy,
      badges: formData.isVerified ? ['Verified'] : []
    };

    let res;
    if (editModeId) {
      res = await editLeadTrader(editModeId, payload);
    } else {
      res = await createLeadTrader(payload);
    }

    if (res.success) {
      setMsg({ type: 'success', text: `Lead Trader ${editModeId ? 'updated' : 'added'} successfully!` });
      resetForm();
    } else {
      setMsg({ type: 'error', text: res.message });
    }
    
    setIsSubmitting(false);
    setTimeout(() => setMsg(null), 4000);
  };

  const handleEditClick = (trader: any) => {
    setEditModeId(trader.id);
    setFormData({
      name: trader.name || '',
      handle: trader.handle || '',
      roi: trader.roi?.toString() || '0',
      winRate: trader.winRate?.toString() || '0',
      aum: trader.aum?.toString() || '0',
      followers: trader.followers?.toString() || '0',
      riskScore: trader.riskScore?.toString() || '5',
      profitShare: trader.profitShare?.toString() || '10',
      strategy: trader.strategy || '',
      isVerified: (trader.badges || []).includes('Verified')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const resetForm = () => {
    setEditModeId(null);
    setFormData({
      name: '', handle: '', roi: '', winRate: '', aum: '', followers: '',
      riskScore: '5', profitShare: '10', strategy: '', isVerified: false
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this trader? This action cannot be undone.")) return;
    
    setDeletingId(id);
    const res = await deleteLeadTrader(id);
    
    if (res.success) {
      setMsg({ type: 'success', text: 'Trader deleted successfully.' });
      if (editModeId === id) resetForm(); 
    } else {
      setMsg({ type: 'error', text: res.message });
    }
    setDeletingId(null);
    setTimeout(() => setMsg(null), 4000);
  };

  // 🔥 Replaced ugly prompt with a trigger for the new Modal
  const openBoostModal = (subId: number, currentAmt: number) => {
    setBoostModal({ isOpen: true, subId, currentAmt, inputAmt: currentAmt.toString() });
  };

  // 🔥 API call executed when the modal "Confirm" button is clicked
  const submitBoost = async () => {
    if (!boostModal.subId || !boostModal.inputAmt) return;
    
    try {
      const res = await copyTradingApi.updateSubscriptionAdmin(boostModal.subId, { allocated_amount: Number(boostModal.inputAmt) });
      if (res.success) {
        setMsg({ type: 'success', text: `Boosted allocation to $${boostModal.inputAmt}` });
        fetchAllSubscriptions();
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Boost failed' });
    }
    
    setBoostModal({ isOpen: false, subId: null, currentAmt: 0, inputAmt: '' });
    setTimeout(() => setMsg(null), 4000);
  };

  const formatAUM = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const activeTraders = traders as any[];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-app-card border border-app p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-black text-app">Lead Traders Management</h1>
          <p className="text-xs text-app-sec mt-1">Add, update, or remove master traders on the leaderboard.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
          <Users className="w-4 h-4" />
          <span className="text-xs font-bold">{activeTraders.length} Active Traders</span>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-bold animate-in fade-in ${
          msg.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' : 'bg-red-500/15 border-red-500/30 text-red-500'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD / EDIT TRADER FORM */}
        <div className={`lg:col-span-1 border rounded-2xl p-5 shadow-sm h-fit transition-all ${
          editModeId ? 'bg-blue-500/5 border-blue-500/30' : 'bg-app-card border-app'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-app mb-4">
            <div className="flex items-center gap-2">
              {editModeId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-accent" />}
              <h2 className="text-sm font-bold text-app">{editModeId ? 'Update Trader' : 'Add New Trader'}</h2>
            </div>
            {editModeId && (
              <button onClick={resetForm} className="text-[10px] font-bold text-red-500 hover:underline">Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-app-sec mb-1">Display Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. CryptoKing" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-app-sec mb-1">Handle (@) *</label>
                <input required type="text" name="handle" value={formData.handle} onChange={handleChange} placeholder="e.g. @cryptoking" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">30D ROI (%)</label>
                  <input required type="number" step="0.01" name="roi" value={formData.roi} onChange={handleChange} placeholder="e.g. 45.5" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">Win Rate (%)</label>
                  <input required type="number" step="0.1" name="winRate" value={formData.winRate} onChange={handleChange} placeholder="e.g. 85" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">AUM (USDT)</label>
                  <input required type="number" name="aum" value={formData.aum} onChange={handleChange} placeholder="e.g. 150000" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">Followers</label>
                  <input required type="number" name="followers" value={formData.followers} onChange={handleChange} placeholder="e.g. 350" className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">Risk Score (1-10)</label>
                  <input type="number" min="1" max="10" name="riskScore" value={formData.riskScore} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-app-sec mb-1">Profit Share (%)</label>
                  <input type="number" name="profitShare" value={formData.profitShare} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-app-sec mb-1">Strategy Description</label>
                <textarea rows={2} name="strategy" value={formData.strategy} onChange={handleChange} placeholder="Briefly describe the trading strategy..." className="w-full px-3 py-2 rounded-xl bg-app-sub border border-app text-xs text-app focus:border-accent focus:outline-none resize-none" />
              </div>

              <div className="flex items-center gap-2 p-3 bg-app-sub rounded-xl border border-app">
                <input type="checkbox" id="isVerified" name="isVerified" checked={formData.isVerified} onChange={handleChange} className="w-4 h-4 accent-emerald-500 rounded cursor-pointer" />
                <label htmlFor="isVerified" className="text-xs font-bold text-app cursor-pointer select-none flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Grant Verified Badge
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${
                editModeId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-accent hover:bg-accent/90'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editModeId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
              {editModeId ? 'Update Lead Trader' : 'Create Lead Trader'}
            </button>
          </form>
        </div>

        {/* ACTIVE TRADERS LIST & SUBSCRIPTIONS TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-app-card border border-app rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-app mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-app">Current Leaderboard</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                    <th className="py-2 px-3">Trader</th>
                    <th className="py-2 px-3">ROI</th>
                    <th className="py-2 px-3">AUM</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app text-xs font-medium">
                  {activeTraders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-app-sec">No active lead traders found.</td>
                    </tr>
                  ) : (
                    activeTraders.map((trader) => (
                      <tr key={trader.id} className="hover:bg-app-sec/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img src={trader.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-app">{trader.name}</span>
                                {trader.badges?.includes('Verified') && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                              </div>
                              <span className="text-[10px] text-app-sec">{trader.handle}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${(trader.roi || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(trader.roi || 0) >= 0 ? '+' : ''}{(trader.roi || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-app font-mono">{formatAUM(trader.aum || 0)}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(trader)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                              title="Edit Trader"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trader.id)}
                              disabled={deletingId === trader.id}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                              title="Delete Trader"
                            >
                              {deletingId === trader.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE SUBSCRIPTIONS TABLE */}
          <div className="bg-app-card border border-app rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-app mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold text-app">Active Copiers & Subscriptions</h2>
              </div>
              <button 
                onClick={fetchAllSubscriptions} 
                disabled={loadingSubs}
                className="text-xs font-bold text-app-sec hover:text-app"
              >
                {loadingSubs ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                    <th className="py-2 px-3">Copier User</th>
                    <th className="py-2 px-3">Master Trader</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Allocated</th>
                    <th className="py-2 px-3 text-right">Boost Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app text-xs font-medium">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-app-sec">No active subscriptions found.</td>
                    </tr>
                  ) : (
                    subscriptions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-app-sec/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-app">{sub.user_email || `User #${sub.follower_id}`}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-app">{sub.trader_name || `Trader #${sub.trader_id}`}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-app-sec text-app-sec'
                          }`}>
                            {sub.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-500 font-mono">${Number(sub.allocated).toLocaleString()} USDT</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => openBoostModal(sub.id, Number(sub.allocated))}
                            disabled={sub.status?.toUpperCase() !== 'ACTIVE'}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-500"
                            title="Boost Allocation"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* 🔥 NEW Custom Boost Modal Overlay */}
      {boostModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-app flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" /> Boost Allocation
              </h3>
              <button onClick={() => setBoostModal({ ...boostModal, isOpen: false })}>
                <X className="w-5 h-5 text-app-sec hover:text-app transition-colors" />
              </button>
            </div>
            
            <p className="text-xs text-app-sec">
              You are manually adjusting the USDT allocation for <strong className="text-app">Subscription #{boostModal.subId}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-app-sec mb-1">New Allocation Amount (USDT)</label>
              <input
                type="number"
                value={boostModal.inputAmt}
                onChange={(e) => setBoostModal({ ...boostModal, inputAmt: e.target.value })}
                className="w-full bg-app-sec border border-app rounded-xl px-3 py-3 text-sm font-bold text-app focus:outline-none focus:border-accent font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setBoostModal({ ...boostModal, isOpen: false })}
                className="flex-1 py-3 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitBoost}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Boost
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};