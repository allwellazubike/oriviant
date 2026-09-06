import React, { useState } from 'react';
import { X, ArrowRightLeft, Check, AlertCircle } from 'lucide-react';
import { WalletAssetDetail, WalletSubAccount } from '../../types/wallet';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletDetails: WalletAssetDetail[];
  onExecuteTransfer: (assetSymbol: string, amount: number, from: WalletSubAccount, to: WalletSubAccount) => boolean;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  walletDetails,
  onExecuteTransfer
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('USDT');
  const [fromWallet, setFromWallet] = useState<WalletSubAccount>('spot');
  const [toWallet, setToWallet] = useState<WalletSubAccount>('futures');
  const [amountInput, setAmountInput] = useState<string>('500');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentAsset = walletDetails.find(a => a.symbol === selectedSymbol) || walletDetails[0];

  const getSubAccountBalance = (sub: WalletSubAccount) => {
    if (sub === 'spot') return currentAsset.spotBalance;
    if (sub === 'futures') return currentAsset.futuresBalance;
    return currentAsset.fundingBalance;
  };

  const availableBalance = getSubAccountBalance(fromWallet);

  const handleSwap = () => {
    const temp = fromWallet;
    setFromWallet(toWallet);
    setToWallet(temp);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const amt = parseFloat(amountInput);
    if (!amt || amt <= 0) {
      setMsg({ type: 'error', text: 'Enter a valid transfer amount.' });
      return;
    }

    if (amt > availableBalance) {
      setMsg({ type: 'error', text: `Insufficient balance in ${fromWallet.toUpperCase()} wallet.` });
      return;
    }

    const ok = onExecuteTransfer(selectedSymbol, amt, fromWallet, toWallet);
    if (ok) {
      setMsg({ type: 'success', text: `Transferred ${amt} ${selectedSymbol} from ${fromWallet.toUpperCase()} to ${toWallet.toUpperCase()} instantly with ZERO fees!` });
      setTimeout(() => {
        setMsg(null);
        onClose();
      }, 2000);
    } else {
      setMsg({ type: 'error', text: 'Transfer failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-app-card border border-app shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-app flex items-center justify-between bg-app-sub/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-app">Internal Wallet Transfer</h2>
              <p className="text-[11px] text-app-sec">Instant zero-fee transfer between sub-accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-app-sec hover:text-app">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransferSubmit} className="p-6 space-y-5">
          {msg && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              msg.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' 
                : 'bg-amber-500/15 border-amber-500/30 text-amber-500'
            }`}>
              {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Select Asset */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-app-sec uppercase">Select Asset</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
            >
              {walletDetails.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* From -> To Switcher */}
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-3 relative">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-app-sec uppercase">From</span>
              <select
                value={fromWallet}
                onChange={(e) => setFromWallet(e.target.value as WalletSubAccount)}
                className="w-full px-3 py-2 rounded-xl bg-app-card border border-app text-xs font-extrabold text-app"
              >
                <option value="spot">Spot Wallet (Available: {currentAsset.spotBalance})</option>
                <option value="futures">Futures Wallet (Available: {currentAsset.futuresBalance})</option>
                <option value="funding">Funding Wallet (Available: {currentAsset.fundingBalance})</option>
              </select>
            </div>

            <div className="flex justify-center my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2 rounded-full bg-accent hover:bg-accent/90 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Swap From and To Wallets"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-app-sec uppercase">To</span>
              <select
                value={toWallet}
                onChange={(e) => setToWallet(e.target.value as WalletSubAccount)}
                className="w-full px-3 py-2 rounded-xl bg-app-card border border-app text-xs font-extrabold text-app"
              >
                <option value="spot">Spot Wallet (Available: {currentAsset.spotBalance})</option>
                <option value="futures">Futures Wallet (Available: {currentAsset.futuresBalance})</option>
                <option value="funding">Funding Wallet (Available: {currentAsset.fundingBalance})</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="text-[10px] font-bold text-app-sec uppercase">Transfer Amount</label>
              <span className="text-[10px] text-app-sec">Available: <strong className="text-app">{availableBalance} {selectedSymbol}</strong></span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent pr-16"
              />
              <button
                type="button"
                onClick={() => setAmountInput(availableBalance.toString())}
                className="absolute right-2 top-1.5 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-extrabold text-[10px]"
              >
                MAX
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent text-white font-extrabold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
          >
            Confirm Internal Transfer
          </button>
        </form>

      </div>
    </div>
  );
};
