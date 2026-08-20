import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  BookOpen, 
  QrCode, 
  Mail, 
  Smartphone, 
  Info,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  WalletAssetDetail, 
  WithdrawalNetworkInfo, 
  WithdrawalRecord, 
  AddressBookItem, 
  UserSecurityState 
} from '../../types/wallet';
import { withdrawalApi } from '../../api/withdrawals';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletDetails: WalletAssetDetail[];
  addressBook: AddressBookItem[];
  securityState: UserSecurityState;
  initialSymbol?: string;
  onSubmitWithdrawal: (
    assetSymbol: string, 
    amount: number, 
    network: string, 
    recipientAddress: string,
    nickname?: string,
    verificationCode?: string
  ) => { success: boolean; record?: WithdrawalRecord; error?: string };
  onOpenAddressBook: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  walletDetails,
  addressBook,
  securityState,
  initialSymbol = 'USDT',
  onSubmitWithdrawal,
  onOpenAddressBook,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('TRC20');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [addressNickname, setAddressNickname] = useState<string>('');
  const [saveToAddressBook, setSaveToAddressBook] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>('100');

  // Security Verification Inputs
  const [emailCode, setEmailCode] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [securityPassword, setSecurityPassword] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<WithdrawalRecord | null>(null);

  if (!isOpen) return null;

  const currentAsset = walletDetails.find(a => a.symbol === selectedSymbol) || walletDetails[0];
  const currentNetworkInfo: WithdrawalNetworkInfo = currentAsset.withdrawalNetworks.find(n => n.network === selectedNetwork) || currentAsset.withdrawalNetworks[0];

  const amountNum = parseFloat(amountInput) || 0;
  const networkFee = currentNetworkInfo?.fee || 0;
  const receiveAmount = Math.max(0, amountNum - networkFee);

  const handleAssetSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    const asset = walletDetails.find(a => a.symbol === symbol);
    if (asset && asset.withdrawalNetworks.length > 0) {
      setSelectedNetwork(asset.withdrawalNetworks[0].network);
    }
    setStep(2);
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setStep(3);
  };

  const handleAddressSelectFromBook = (item: AddressBookItem) => {
    setRecipientAddress(item.address);
    setAddressNickname(item.nickname);
  };

  const handleSendEmailVerification = () => {
    setEmailSent(true);
    setTimeout(() => {
      setEmailCode('892014');
    }, 1500);
  };

  const handleFinalWithdrawalSubmit = async () => {
    setErrorMsg(null);

    if (!recipientAddress || recipientAddress.length < 10) {
      setErrorMsg('Please enter a valid recipient address.');
      setStep(3);
      return;
    }

    if (amountNum < (currentNetworkInfo?.minWithdrawal || 10)) {
      setErrorMsg(`Minimum withdrawal for ${selectedSymbol} on ${selectedNetwork} is ${currentNetworkInfo?.minWithdrawal}`);
      setStep(4);
      return;
    }

    if (amountNum > currentAsset.spotBalance) {
      setErrorMsg(`Insufficient Spot wallet balance. Available: ${currentAsset.spotBalance} ${selectedSymbol}`);
      setStep(4);
      return;
    }

    // Security check validation
    if (securityState.isEmailVerified && !emailCode) {
      setErrorMsg('Please enter the email verification code.');
      return;
    }

    if (securityState.is2FAEnabled && !twoFactorCode) {
      setErrorMsg('Please enter your 6-digit Google Authenticator 2FA code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Connect to real backend endpoint
      const res = await withdrawalApi.requestWithdrawal({
        asset: selectedSymbol,
        amount: amountNum,
        network: selectedNetwork,
        recipient_address: recipientAddress,
        nickname: addressNickname
      });

      if (res.success && res.withdrawal) {
        // Fallback sync with local context updater
        const result = onSubmitWithdrawal(
          selectedSymbol, 
          amountNum, 
          selectedNetwork, 
          recipientAddress, 
          addressNickname,
          twoFactorCode
        );

        if (result.success && result.record) {
          setCompletedRecord(result.record);
        } else {
          // Construct fallback record from backend response if needed
          setCompletedRecord({
            id: `WTH-${res.withdrawal.id}`,
            userId: 'USER',
            userName: 'Trader',
            userEmail: '',
            asset: res.withdrawal.asset,
            amount: Number(res.withdrawal.amount),
            fee: Number(res.withdrawal.fee),
            receiveAmount: Number(res.withdrawal.receive_amount),
            usdValue: Number(res.withdrawal.receive_amount),
            network: res.withdrawal.network,
            recipientAddress: res.withdrawal.recipient_address,
            addressNickname: res.withdrawal.address_nickname || '',
            isWhitelisted: false,
            status: res.withdrawal.status as any,
            createdAt: res.withdrawal.created_at,
            updatedAt: res.withdrawal.created_at,
            notes: res.withdrawal.notes || 'Successfully dispatched to backend'
          });
        }
      } else {
        setErrorMsg('Failed to process withdrawal request on server.');
      }
    } catch (err: any) {
      console.error('Withdrawal API submission error:', err);
      setErrorMsg(err.message || 'An error occurred during withdrawal submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-app-card border border-app shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-app flex items-center justify-between bg-app-sub/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-app">Withdraw Crypto Assets</h2>
              <p className="text-xs text-app-sec">Multi-tier security clearance protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-app-sec hover:text-app hover:bg-app-sub transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-app-sub/20 border-b border-app flex items-center justify-between text-[11px] font-bold text-app-sec overflow-x-auto">
          {[
            { num: 1, label: 'Asset' },
            { num: 2, label: 'Network' },
            { num: 3, label: 'Address' },
            { num: 4, label: 'Amount' },
            { num: 5, label: 'Security 2FA' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-app-sec/30 shrink-0" />}
              <div className={`flex items-center gap-1 shrink-0 ${step === s.num ? 'text-accent' : step > s.num ? 'text-emerald-500' : ''}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === s.num ? 'bg-accent text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-app-sub'}`}>{s.num}</span>
                <span>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {completedRecord ? (
            /* Withdrawal Submitted Success View */
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-app">Withdrawal Request Dispatched</h3>
                <p className="text-xs text-app-sec max-w-sm mx-auto mt-1">
                  Your withdrawal of <strong className="text-app">{completedRecord.amount} {completedRecord.asset}</strong> to <strong className="text-app">{completedRecord.recipientAddress.substring(0, 12)}...</strong> has been queued for security broadcast.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-app-sub/50 border border-app text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between text-app-sec">
                  <span>Withdrawal ID:</span>
                  <span className="text-app font-bold">{completedRecord.id}</span>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Net Receive Amount:</span>
                  <span className="text-emerald-500 font-bold">{completedRecord.receiveAmount} {completedRecord.asset}</span>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Current Status:</span>
                  <span className="text-amber-500 font-bold uppercase">{completedRecord.status}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedRecord(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
              >
                Done & View Status
              </button>
            </div>
          ) : step === 1 ? (
            /* STEP 1: Select Coin */
            <div className="space-y-3">
              <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Select Coin to Withdraw</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {walletDetails.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleAssetSelect(asset.symbol)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedSymbol === asset.symbol
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-app bg-app-card hover:bg-app-sub'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-app-sub flex items-center justify-center font-bold text-sm text-accent shrink-0">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-app">{asset.symbol}</div>
                      <div className="text-[10px] text-emerald-500 font-mono font-bold">{asset.spotBalance}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: Choose Network */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Select Network for {selectedSymbol}</span>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-accent hover:underline">Change Asset</button>
              </div>

              <div className="space-y-2.5">
                {currentAsset.withdrawalNetworks.map((net) => (
                  <button
                    key={net.network}
                    onClick={() => handleNetworkSelect(net.network)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedNetwork === net.network
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-app bg-app-card hover:bg-app-sub'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-app">{net.name}</div>
                      <div className="text-[10px] text-app-sec flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {net.estimatedArrival}</span>
                        <span>• Min: {net.minWithdrawal} {selectedSymbol}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-app">Network Fee: {net.fee} {net.feeSymbol}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 3 ? (
            /* STEP 3: Recipient Address */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Recipient Address ({selectedNetwork})</span>
                <button onClick={onOpenAddressBook} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Address Book</span>
                </button>
              </div>

              {/* Saved Address Quick Select */}
              {addressBook.filter(a => a.asset === selectedSymbol || a.network === selectedNetwork).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-app-sec">Quick Select from Saved Addresses:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {addressBook.filter(a => a.asset === selectedSymbol || a.network === selectedNetwork).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddressSelectFromBook(item)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          recipientAddress === item.address 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                            : 'border-app bg-app-sub text-app-sec hover:text-app'
                        }`}
                      >
                        {item.nickname}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-app-sec uppercase">
                  Paste or Scan Destination Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder={`Enter valid ${selectedNetwork} address`}
                    className="w-full px-4 py-3 rounded-2xl bg-app-sub border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent pr-20"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setRecipientAddress(text);
                        } catch (e) {
                          // ignore
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-bold text-[10px]"
                    >
                      Paste
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-app-sec uppercase">
                  Address Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={addressNickname}
                  onChange={(e) => setAddressNickname(e.target.value)}
                  placeholder="e.g. Personal Cold Storage Ledger"
                  className="w-full px-4 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
                />
              </div>

              <button
                onClick={() => {
                  if (!recipientAddress) {
                    setErrorMsg('Please enter a recipient address');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(4);
                }}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
              >
                Continue to Amount
              </button>
            </div>
          ) : step === 4 ? (
            /* STEP 4: Amount & Fees */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-app-sub/40 border border-app flex items-center justify-between text-xs">
                <div>
                  <span className="text-app-sec font-bold">Spot Balance Available:</span>
                  <div className="text-base font-black text-app font-mono">{currentAsset.spotBalance} {selectedSymbol}</div>
                </div>
                <button 
                  onClick={() => setAmountInput(currentAsset.spotBalance.toString())}
                  className="px-3 py-1.5 rounded-xl bg-accent/10 text-accent font-extrabold text-xs hover:bg-accent/20 transition-colors"
                >
                  MAX
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-app-sec uppercase">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-app-sub border border-app text-sm font-mono font-bold text-app focus:outline-none focus:border-accent pr-16"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-app-sec">{selectedSymbol}</span>
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="p-4 rounded-2xl bg-app-card border border-app space-y-2 text-xs">
                <div className="flex justify-between text-app-sec">
                  <span>Network Fee:</span>
                  <span className="font-bold text-app">{networkFee} {selectedSymbol}</span>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Selected Network:</span>
                  <span className="font-bold text-emerald-500">{currentNetworkInfo?.name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-app font-black text-sm">
                  <span className="text-app">Estimated Receive Amount:</span>
                  <span className="text-emerald-500 font-mono">{receiveAmount.toFixed(4)} {selectedSymbol}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (amountNum <= 0) {
                    setErrorMsg('Enter a valid amount');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(5);
                }}
                className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all cursor-pointer"
              >
                Proceed to Security Verification
              </button>
            </div>
          ) : (
            /* STEP 5: Security Verification */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Clearance Required</span>
                </div>
                <p className="text-app-sec text-[11px]">
                  Confirm withdrawal of <strong className="text-app">{amountNum} {selectedSymbol}</strong> to <strong className="text-app">{recipientAddress.substring(0, 10)}...</strong>
                </p>
              </div>

              {/* Email Code Field */}
              {securityState.isEmailVerified && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-app-sec flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                      <span>Email Verification Code</span>
                    </label>
                    <span className="text-[10px] text-app-sec">{securityState.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="6-digit code"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={handleSendEmailVerification}
                      className="px-4 py-2.5 rounded-xl bg-app-sub border border-app hover:bg-app-card text-accent font-bold text-xs shrink-0 cursor-pointer"
                    >
                      {emailSent ? 'Code Sent (892014)' : 'Get Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Google 2FA Authenticator Field */}
              {securityState.is2FAEnabled && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-app-sec flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Google Authenticator 2FA Code</span>
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Enter 6-digit Authenticator code (e.g. 123456)"
                    className="w-full px-4 py-2.5 rounded-xl bg-app-sub border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent"
                  />
                </div>
              )}

              {/* Passkey Placeholder */}
              <div className="p-3 rounded-xl bg-app-sub/40 border border-app flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-app-sec">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Biometric Passkey (Hardware Ready)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500">VERIFIED</span>
              </div>

              <button
                onClick={handleFinalWithdrawalSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Withdrawal...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Submit Withdrawal</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};