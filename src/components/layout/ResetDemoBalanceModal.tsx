import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useDemoMode } from '../../contexts/DemoModeContext';

interface ResetDemoBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDemoBalanceModal: React.FC<ResetDemoBalanceModalProps> = ({ isOpen, onClose }) => {
  const { resetDemoBalance } = useDemoMode();

  if (!isOpen) return null;

  const handleConfirm = () => {
    resetDemoBalance();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-app">Reset Demo Account</h3>
            <p className="text-xs text-app-sec">Restore $10,000 default virtual funds</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-app-sec/50 border border-app space-y-2">
          <p className="text-xs font-bold text-app leading-snug">
            Reset your Demo Practice account to the default $10,000 balance? All demo positions and history will be erased.
          </p>
          <p className="text-[11px] text-app-sec">
            Your live trading account, real balances, and live positions remain completely unaffected.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-app bg-app-card hover:bg-app-sec text-app font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
