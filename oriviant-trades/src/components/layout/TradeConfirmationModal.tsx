import React from 'react';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface TradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tradeDetails?: {
    pair: string;
    type: string;
    side: string;
    amount: string | number;
    price?: string | number;
    leverage?: number;
  };
}

export const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tradeDetails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-app-card border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-app uppercase tracking-wide">Demo Account</h3>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trading with Virtual Funds
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20">
            DEMO
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-app-sec/60 border border-app space-y-3">
          <p className="text-xs font-semibold text-app-sec">
            This trade does not use real money.
          </p>

          {tradeDetails && (
            <div className="space-y-1.5 pt-2 border-t border-app/60 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-app-sec">Market Pair:</span>
                <span className="font-bold text-app">{tradeDetails.pair}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Order Type & Side:</span>
                <span className={`font-bold capitalize ${tradeDetails.side === 'buy' || tradeDetails.side === 'long' ? 'text-positive' : 'text-negative'}`}>
                  {tradeDetails.type} {tradeDetails.side.toUpperCase()}
                  {tradeDetails.leverage ? ` (${tradeDetails.leverage}x)` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Amount:</span>
                <span className="font-bold text-app">{tradeDetails.amount}</span>
              </div>
              {tradeDetails.price && (
                <div className="flex justify-between">
                  <span className="text-app-sec">Price:</span>
                  <span className="font-bold text-app">${tradeDetails.price}</span>
                </div>
              )}
            </div>
          )}
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Confirm Trade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
