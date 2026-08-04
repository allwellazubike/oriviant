import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Percent, 
  Zap, 
  Sliders, 
  Activity,
  Layers
} from 'lucide-react';

interface MarketPair {
  id: string;
  symbol: string;
  type: 'Spot' | 'Futures';
  status: 'Active' | 'Maintenance' | 'Suspended';
  price: string;
  volume24h: string;
  makerFee: string;
  takerFee: string;
  maxLeverage: string;
}

export const AdminMarketsTab: React.FC = () => {
  const [markets, setMarkets] = useState<MarketPair[]>([
    { id: '1', symbol: 'BTC/USDT', type: 'Futures', status: 'Active', price: '$94,250.00', volume24h: '$2.14B', makerFee: '0.015%', takerFee: '0.035%', maxLeverage: '125x' },
    { id: '2', symbol: 'ETH/USDT', type: 'Futures', status: 'Active', price: '$3,480.50', volume24h: '$1.12B', makerFee: '0.015%', takerFee: '0.035%', maxLeverage: '100x' },
    { id: '3', symbol: 'SOL/USDT', type: 'Spot', status: 'Active', price: '$210.40', volume24h: '$480M', makerFee: '0.080%', takerFee: '0.100%', maxLeverage: '1x' },
    { id: '4', symbol: 'XRP/USDT', type: 'Futures', status: 'Active', price: '$2.45', volume24h: '$310M', makerFee: '0.015%', takerFee: '0.035%', maxLeverage: '50x' },
    { id: '5', symbol: 'AVAX/USDT', type: 'Spot', status: 'Maintenance', price: '$38.20', volume24h: '$95M', makerFee: '0.080%', takerFee: '0.100%', maxLeverage: '1x' },
    { id: '6', symbol: 'DOGE/USDT', type: 'Futures', status: 'Active', price: '$0.385', volume24h: '$220M', makerFee: '0.020%', takerFee: '0.040%', maxLeverage: '50x' },
  ]);

  const [filterType, setFilterType] = useState<'All' | 'Spot' | 'Futures'>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAddingPair, setIsAddingPair] = useState(false);

  // New Pair Form State
  const [newSymbol, setNewSymbol] = useState('');
  const [newType, setNewType] = useState<'Spot' | 'Futures'>('Spot');
  const [newLeverage, setNewLeverage] = useState('50x');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleMarketStatus = (id: string) => {
    setMarkets(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus: MarketPair['status'] = m.status === 'Active' ? 'Maintenance' : 'Active';
        showToast(`${m.symbol} market status switched to ${nextStatus}.`);
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const handleAddPairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;

    const formatted = newSymbol.toUpperCase().includes('/') ? newSymbol.toUpperCase() : `${newSymbol.toUpperCase()}/USDT`;
    const newMarket: MarketPair = {
      id: Date.now().toString(),
      symbol: formatted,
      type: newType,
      status: 'Active',
      price: '$1.00',
      volume24h: '$0',
      makerFee: newType === 'Futures' ? '0.015%' : '0.080%',
      takerFee: newType === 'Futures' ? '0.035%' : '0.100%',
      maxLeverage: newType === 'Futures' ? newLeverage : '1x',
    };

    setMarkets([newMarket, ...markets]);
    setIsAddingPair(false);
    setNewSymbol('');
    showToast(`Successfully listed new market pair ${formatted}!`);
  };

  const filteredMarkets = markets.filter(m => {
    if (filterType === 'All') return true;
    return m.type === filterType;
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

      {/* Control Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Market Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {(['All', 'Spot', 'Futures'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filterType === t
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              {t} Markets
            </button>
          ))}
        </div>

        {/* Add Pair Button */}
        <button
          onClick={() => setIsAddingPair(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>List New Market Pair</span>
        </button>

      </div>

      {/* Markets Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Active Market Catalog ({filteredMarkets.length} Pairs)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                <th className="pb-3 pl-2">Market Symbol</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Index Price</th>
                <th className="pb-3">24h Volume</th>
                <th className="pb-3">Maker / Taker Fee</th>
                <th className="pb-3">Max Leverage</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/60 text-xs font-medium">
              {filteredMarkets.map((m) => (
                <tr key={m.id} className="hover:bg-app-sec/30 transition-colors">
                  <td className="py-3.5 pl-2 font-black text-app text-xs sm:text-sm">
                    {m.symbol}
                  </td>

                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      m.type === 'Futures' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {m.type}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      m.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3.5 font-bold text-app font-mono">{m.price}</td>
                  <td className="py-3.5 text-app-sec font-mono">{m.volume24h}</td>
                  <td className="py-3.5 text-app-sec">{m.makerFee} / {m.takerFee}</td>
                  <td className="py-3.5 font-bold text-accent">{m.maxLeverage}</td>

                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => toggleMarketStatus(m.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        m.status === 'Active'
                          ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {m.status === 'Active' ? 'Set Maintenance' : 'Activate Market'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Market Pair Modal */}
      {isAddingPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <span>List New Trading Pair</span>
              </h3>
              <button onClick={() => setIsAddingPair(false)} className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPairSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-app-sec mb-1">Pair Symbol (e.g., SOL/USDT)</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="SOL/USDT"
                  required
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Market Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                  >
                    <option value="Spot">Spot Market</option>
                    <option value="Futures">Futures Contract</option>
                  </select>
                </div>

                {newType === 'Futures' && (
                  <div>
                    <label className="block font-bold text-app-sec mb-1">Max Leverage</label>
                    <select
                      value={newLeverage}
                      onChange={(e) => setNewLeverage(e.target.value)}
                      className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                    >
                      <option value="20x">20x</option>
                      <option value="50x">50x</option>
                      <option value="100x">100x</option>
                      <option value="125x">125x</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPair(false)}
                  className="px-4 py-2.5 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-md"
                >
                  List Pair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
