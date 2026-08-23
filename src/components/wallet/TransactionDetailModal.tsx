import React from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { DepositRecord, WithdrawalRecord } from '../../types/wallet';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DepositRecord | WithdrawalRecord | null;
  type: 'deposit' | 'withdrawal';
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  type
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !record) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'Pending':
      case 'Confirming':
      case 'Under Review':
      case 'Processing':
      case 'Broadcasted':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-black flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'Rejected':
      case 'Cancelled':
      case 'Failed':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-black flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-app-sub text-app-sec text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const isDeposit = type === 'deposit';
  const dep = isDeposit ? (record as DepositRecord) : null;
  const wth = !isDeposit ? (record as WithdrawalRecord) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-app-card border border-app shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-app flex items-center justify-between bg-app-sub/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDeposit ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
              {isDeposit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-app">
                {isDeposit ? 'Deposit Transaction Details' : 'Withdrawal Transaction Details'}
              </h2>
              <p className="text-[11px] font-mono text-app-sec">{record.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-app-sec hover:text-app">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Amount & Status Hero Card */}
          <div className="p-5 rounded-2xl bg-app-sub/40 border border-app text-center space-y-3">
            <div className="flex justify-center">{getStatusBadge(record.status)}</div>
            <div className="text-3xl font-black text-app font-mono">
              {record.amount} <span className="text-base font-bold text-accent">{record.asset}</span>
            </div>
            <div className="text-xs text-app-sec font-mono">
              ≈ ${record.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>

          {/* Details Table */}
          <div className="p-4 rounded-2xl bg-app-card border border-app space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
              <span>Network:</span>
              <span className="font-bold text-app">{record.network}</span>
            </div>

            {dep && (
              <>
                <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
                  <span>Deposit Address:</span>
                  <span className="font-bold text-app truncate max-w-[200px]">{dep.depositAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
                  <span>Confirmations:</span>
                  <span className="font-bold text-amber-500">{dep.confirmations} / {dep.requiredConfirmations}</span>
                </div>
              </>
            )}

            {wth && (
              <>
                <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
                  <span>Recipient Address:</span>
                  <span className="font-bold text-app truncate max-w-[200px]">{wth.recipientAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
                  <span>Network Fee:</span>
                  <span className="font-bold text-app">{wth.fee} {wth.asset}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
                  <span>Receive Amount:</span>
                  <span className="font-bold text-emerald-500">{wth.receiveAmount} {wth.asset}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-1 border-b border-app/50 text-app-sec">
              <span>Created At:</span>
              <span className="font-bold text-app">{record.createdAt}</span>
            </div>

            <div className="flex justify-between py-1 text-app-sec">
              <span>Last Updated:</span>
              <span className="font-bold text-app">{record.updatedAt}</span>
            </div>
          </div>

          {/* Transaction Hash & Explorer */}
          {record.txHash && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-app-sec uppercase">Blockchain Tx Hash</label>
              <div className="p-3 rounded-xl bg-app-sub border border-app flex items-center justify-between gap-2 text-xs font-mono">
                <span className="text-accent truncate">{record.txHash}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(record.txHash!)}
                    className="p-1.5 rounded-lg hover:bg-app-card text-app-sec hover:text-app"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={record.explorerUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-app-card text-accent"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Notes or Audit details */}
          {record.notes && (
            <div className="p-3.5 rounded-xl bg-app-sub/40 border border-app text-xs space-y-1">
              <span className="font-bold text-app-sec text-[10px] uppercase">Compliance & Processing Notes:</span>
              <p className="text-app text-xs leading-relaxed">{record.notes}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
