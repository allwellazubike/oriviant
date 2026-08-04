import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  X,
  AlertCircle,
  RotateCcw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useUser } from '../../contexts/UserContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { ResetDemoBalanceModal } from '../layout/ResetDemoBalanceModal';

export const AssetsView: React.FC = () => {
  const { walletAssets, depositAsset, withdrawAsset } = useUser();
  const { isDemoMode, toggleDemoMode, demoBalance } = useDemoMode();

  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('USDT');
  const [amountInput, setAmountInput] = useState<string>('1000');
  const [addressInput, setAddressInput] = useState<string>('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [msg, setMsg] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const totalValueUsdt = walletAssets.reduce((acc, a) => acc + a.valueUsdt, 0);

  const chartData = isDemoMode 
    ? [{ name: 'Virtual USDT', value: demoBalance }]
    : walletAssets.map((asset) => ({
        name: asset.symbol,
        value: asset.valueUsdt
      }));

  const COLORS = ['#10B981', '#2962FF', '#FFB300', '#9C27B0', '#FF4D4F'];

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      setMsg("Demo Accounts use virtual funds only. Switch to Live Account to deposit or withdraw real assets.");
      setTimeout(() => setMsg(null), 4000);
      setModalType(null);
      return;
    }

    const numAmt = parseFloat(amountInput);
    if (!numAmt || numAmt <= 0) return;

    if (modalType === 'deposit') {
      depositAsset(selectedSymbol, numAmt);
      setMsg(`Successfully deposited ${numAmt} ${selectedSymbol}`);
    } else if (modalType === 'withdraw') {
      const ok = withdrawAsset(selectedSymbol, numAmt, addressInput);
      if (ok) {
        setMsg(`Withdrawal of ${numAmt} ${selectedSymbol} initiated to ${addressInput.substring(0, 10)}...`);
      } else {
        setMsg(`Insufficient available balance for withdrawal.`);
      }
    }
    setTimeout(() => setMsg(null), 3500);
    setModalType(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <ResetDemoBalanceModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      {/* Demo Account Indicator Banner */}
      {isDemoMode && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15">
              <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-wider block">
                🟢 DEMO WALLET - VIRTUAL FUNDS
              </span>
              <p className="text-[11px] text-emerald-400/90 font-medium">
                Demo Accounts use virtual funds only. Switch to Live Account to deposit or withdraw real assets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 10,000 USDT</span>
            </button>
            <button
              onClick={toggleDemoMode}
              className="px-3.5 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
            >
              Switch to Live Account
            </button>
          </div>
        </div>
      )}

      {/* Wallet Overview Banner */}
      <div className="p-4 sm:p-8 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                isDemoMode ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              }`}>
                {isDemoMode ? 'ORIVIANT DEMO VIRTUAL WALLET' : 'ORIVIANT ASSET WALLET'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-app">
              {isDemoMode ? 'Demo Portfolio Overview' : 'Portfolio Overview'}
            </h1>
            <p className="text-xs text-app-sec">
              {isDemoMode ? 'Virtual multi-asset balance for practice & testing.' : 'Multi-asset wallet management & transaction logs.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={() => {
                if (isDemoMode) {
                  setMsg("Demo Accounts use virtual funds only. Switch to Live Account to deposit or withdraw real assets.");
                  setTimeout(() => setMsg(null), 4000);
                  return;
                }
                setSelectedSymbol('USDT');
                setModalType('deposit');
              }}
              className="px-4 py-3 sm:py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                if (isDemoMode) {
                  setMsg("Demo Accounts use virtual funds only. Switch to Live Account to deposit or withdraw real assets.");
                  setTimeout(() => setMsg(null), 4000);
                  return;
                }
                setSelectedSymbol('USDT');
                setModalType('withdraw');
              }}
              className="px-4 py-3 sm:py-2.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Message Toast */}
        {msg && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
            <button onClick={() => setMsg(null)} className="p-1 hover:opacity-80"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Total Net Asset Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-1">
            <span className="text-xs font-semibold text-app-sec">Total Estimated Net Value</span>
            <div className="text-2xl sm:text-4xl font-black text-app font-mono">
              ${activeWalletTab === 'demo' ? demoBalance.toLocaleString() : totalValueUsdt.toLocaleString()}{' '}
              <span className="text-xs sm:text-sm font-semibold text-app-sec">USDT</span>
            </div>
            <p className="text-xs text-app-sec font-mono">
              ≈ {((activeWalletTab === 'demo' ? demoBalance : totalValueUsdt) / 92450.8).toFixed(4)} BTC
            </p>
          </div>

          {/* Allocation Donut Chart */}
          <div className="h-28 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={4}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* Asset Table / Cards */}
      <div className="p-4 sm:p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        
        {/* Toast */}
        {msg && (
          <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-bold flex items-center justify-between">
            <span className="break-words">{msg}</span>
            <button onClick={() => setMsg(null)} className="shrink-0 ml-2"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-app pb-3">
          <h3 className="text-sm font-bold text-app flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            <span>Spot Wallet Assets</span>
          </h3>
          <span className="text-[10px] sm:text-xs text-app-sec">Instant Transfer supported</span>
        </div>

        {/* Mobile Asset Cards View (< MD) */}
        <div className="block md:hidden space-y-3">
          {walletAssets.map((asset) => (
            <div key={asset.symbol} className="p-4 rounded-2xl bg-app-sec/30 border border-app space-y-3">
              <div className="flex items-center justify-between border-b border-app/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                    {asset.icon}
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-app block">{asset.symbol}</span>
                    <span className="text-[10px] text-app-sec">{asset.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-app-sec block">Total Value</span>
                  <span className="font-extrabold text-xs text-app font-mono">
                    ${asset.valueUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-app-sec block">Total Balance</span>
                  <span className="font-bold text-app font-mono">{asset.total.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-app-sec block">Available</span>
                  <span className="font-bold text-app font-mono">{asset.available.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-app-sec block">In Order</span>
                  <span className="font-bold text-app-sec font-mono">{asset.inOrder.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-app/40">
                <button
                  onClick={() => {
                    setSelectedSymbol(asset.symbol);
                    setModalType('deposit');
                  }}
                  className="py-2 px-3 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-bold text-xs border border-accent/20 min-h-[40px]"
                >
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setSelectedSymbol(asset.symbol);
                    setModalType('withdraw');
                  }}
                  className="py-2 px-3 rounded-xl bg-app-card hover:bg-app-sec text-app-sec font-bold text-xs border border-app min-h-[40px]"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Asset Table View (MD & UP) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2.5">Asset</th>
                <th className="py-2.5">Total Balance</th>
                <th className="py-2.5">Available</th>
                <th className="py-2.5">In Order</th>
                <th className="py-2.5 text-right">Value (USDT)</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs font-medium">
              {walletAssets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-app-sec/40 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                        {asset.icon}
                      </div>
                      <div>
                        <span className="font-bold text-app block">{asset.symbol}</span>
                        <span className="text-[10px] text-app-sec">{asset.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-app font-mono">{asset.total.toLocaleString()}</td>
                  <td className="py-3 text-app font-mono">{asset.available.toLocaleString()}</td>
                  <td className="py-3 text-app-sec font-mono">{asset.inOrder.toLocaleString()}</td>
                  <td className="py-3 text-right font-extrabold text-app font-mono">
                    ${asset.valueUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setModalType('deposit');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg mr-1"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setModalType('withdraw');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-app-sec bg-app-sec hover:bg-app-sec/80 rounded-lg"
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Deposit / Withdraw Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-app capitalize">{modalType} {selectedSymbol}</h3>
              <button onClick={() => setModalType(null)}><X className="w-5 h-5 text-app-sec" /></button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Amount</label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none min-h-[44px]"
                />
              </div>

              {modalType === 'withdraw' && (
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Destination Address</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-mono text-app focus:outline-none min-h-[44px]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-xs shadow-lg min-h-[48px]"
              >
                Confirm {modalType}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
