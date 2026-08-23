import React, { useState } from 'react';
import { 
  X, ChevronRight, Copy, Check, QrCode, AlertTriangle, ExternalLink, Clock, ShieldCheck, RefreshCw, Info, Share2
} from 'lucide-react';
import { WalletAssetDetail, DepositNetworkInfo, DepositRecord } from '../../types/wallet';
import { depositApi } from '../../api/deposits';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletDetails: WalletAssetDetail[];
  initialSymbol?: string;
  onConfirmDeposit: (symbol: string, amount: number, network: string) => DepositRecord;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen, onClose, walletDetails, initialSymbol = 'USDT', onConfirmDeposit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('TRC20');
  const [copied, setCopied] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [submittedRecord, setSubmittedRecord] = useState<DepositRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentAsset = walletDetails.find(a => a.symbol === selectedSymbol) || walletDetails[0];
  const currentNetworkInfo: DepositNetworkInfo = currentAsset.depositNetworks.find(n => n.network === selectedNetwork) || currentAsset.depositNetworks[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAssetSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    const asset = walletDetails.find(a => a.symbol === symbol);
    if (asset && asset.depositNetworks.length > 0) {
      setSelectedNetwork(asset.depositNetworks[0].network);
    }
    setStep(2);
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setStep(3);
  };

  const handleSimulateDepositSubmit = async () => {
    const amount = parseFloat(depositAmount) || 100;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fakeTxHash = `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 10)}`;
      
      // FIX: Rely entirely on your secure depositApi which automatically attaches the valid JWT token!
      const res = await depositApi.submitDeposit({
        asset: selectedSymbol,
        amount_expected: amount,
        tx_hash: fakeTxHash,
        network: selectedNetwork
      });

      if (res.success) {
        const rec = onConfirmDeposit(selectedSymbol, amount, selectedNetwork);
        setSubmittedRecord(rec);
      } else {
        setErrorMsg(res.message || 'Deposit submission was rejected by the server.');
      }
    } catch (err: any) {
      console.error('Deposit API Error:', err);
      setErrorMsg(err.message || 'Failed to submit deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQrUrl = (address: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&color=0d1117&bgcolor=ffffff`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-app-card border border-app shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 sm:p-6 border-b border-app flex items-center justify-between bg-app-sub/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-app">Deposit Crypto Assets</h2>
              <p className="text-xs text-app-sec">Instant multi-chain deposit address generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-app-sec hover:text-app hover:bg-app-sub transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-app-sub/20 border-b border-app flex items-center justify-between text-xs font-bold text-app-sec">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-accent' : 'text-emerald-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-accent text-white' : 'bg-emerald-500 text-white'}`}>1</span>
            <span>Select Coin</span>
          </div>
          <ChevronRight className="w-4 h-4 text-app-sec/40" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-accent' : step > 2 ? 'text-emerald-500' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-accent text-white' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-app-sub'}`}>2</span>
            <span>Select Network</span>
          </div>
          <ChevronRight className="w-4 h-4 text-app-sec/40" />
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-accent' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-accent text-white' : 'bg-app-sub'}`}>3</span>
            <span>Deposit Address</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {submittedRecord ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-app">Deposit Request Broadcasted</h3>
                <p className="text-xs text-app-sec max-w-sm mx-auto mt-1">
                  Your deposit of <strong className="text-app">{submittedRecord.amount} {submittedRecord.asset}</strong> on <strong className="text-app">{submittedRecord.network}</strong> has been logged to the database as PENDING.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-app-sub/50 border border-app text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between text-app-sec">
                  <span>Transaction Hash:</span>
                  <span className="text-accent truncate max-w-[180px]">{submittedRecord.txHash}</span>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Confirmations:</span>
                  <span className="text-amber-500 font-bold">{submittedRecord.confirmations} / {submittedRecord.requiredConfirmations}</span>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Status:</span>
                  <span className="text-emerald-500 font-bold uppercase">{submittedRecord.status}</span>
                </div>
              </div>

              <button
                onClick={() => { setSubmittedRecord(null); onClose(); }}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
              >
                Done & View History
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Choose Crypto Asset</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {walletDetails.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleAssetSelect(asset.symbol)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedSymbol === asset.symbol ? 'border-accent bg-accent/10 shadow-sm' : 'border-app bg-app-card hover:bg-app-sub'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-app-sub flex items-center justify-center font-bold text-sm text-accent shrink-0">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-app">{asset.symbol}</div>
                      <div className="text-[10px] text-app-sec truncate">{asset.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Select Network for {selectedSymbol}</span>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-accent hover:underline">Change Asset</button>
              </div>
              <div className="space-y-2.5">
                {currentAsset.depositNetworks.map((net) => (
                  <button
                    key={net.network}
                    onClick={() => handleNetworkSelect(net.network)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedNetwork === net.network ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' : 'border-app bg-app-card hover:bg-app-sub'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold text-app flex items-center gap-2">
                        <span>{net.name}</span>
                      </div>
                      <div className="text-[11px] text-app-sec flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {net.estimatedArrival}</span>
                        <span>Confirmations: {net.requiredConfirmations}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-500">Fee: {net.fee === 0 ? 'FREE' : `${net.fee} ${net.feeSymbol}`}</span>
                      <div className="text-[10px] text-app-sec">Min: {net.minDeposit} {selectedSymbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <div>
                  <span className="text-[10px] font-bold text-app-sec uppercase">Selected Asset & Network</span>
                  <div className="text-sm font-black text-app flex items-center gap-2">
                    <span>{selectedSymbol}</span>
                    <span className="text-app-sec">•</span>
                    <span className="text-emerald-500">{currentNetworkInfo?.name}</span>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="text-xs font-bold text-accent hover:underline">Change Network</button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Important Network Security Warning</span>
                </div>
                <p className="text-[11px] opacity-90 leading-normal">
                  Send <strong>ONLY {selectedSymbol}</strong> to this address. Sending any other asset or using an incorrect network may result in permanent loss of funds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-app-sub/40 p-4 rounded-2xl border border-app">
                <div className="sm:col-span-1 flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-inner">
                  <img src={generateQrUrl(currentNetworkInfo?.depositAddress || '')} alt="Deposit QR" className="w-32 h-32 object-contain" />
                  <span className="text-[9px] font-bold text-slate-800 mt-1">SCAN TO DEPOSIT</span>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-app-sec uppercase mb-1">Deposit Address</label>
                    <div className="p-3 rounded-xl bg-app-card border border-app flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-app break-all select-all">
                        {currentNetworkInfo?.depositAddress}
                      </span>
                      <button onClick={() => handleCopy(currentNetworkInfo?.depositAddress || '')} className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors shrink-0">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(currentNetworkInfo?.depositAddress || '')} className="flex-1 py-2 rounded-xl bg-app-sub hover:bg-app-card text-app font-bold text-xs border border-app transition-all flex items-center justify-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-accent" />
                      <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                    </button>
                    <button onClick={() => handleCopy(`https://oriviant.io/deposit?asset=${selectedSymbol}&address=${currentNetworkInfo?.depositAddress}`)} className="py-2 px-3 rounded-xl bg-app-sub hover:bg-app-card text-app-sec hover:text-app font-bold text-xs border border-app transition-all flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-app-card border border-app space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-app-sec">Submit On-Chain Deposit Request:</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Sends to Backend DB</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-app-sub border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent" placeholder="Amount to deposit" />
                  <button onClick={handleSimulateDepositSubmit} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50">
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isSubmitting ? 'Submitting...' : 'Confirm Deposit'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-app-sub/40 border-t border-app flex items-center justify-between text-xs text-app-sec">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent" />
            <span>Minimum Deposit: {currentNetworkInfo?.minDeposit} {selectedSymbol}</span>
          </div>
          <button onClick={onClose} className="font-bold hover:text-app">Close</button>
        </div>
      </div>
    </div>
  );
};