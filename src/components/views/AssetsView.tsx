import React, { useState, useEffect } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRightLeft, 
  BookOpen, 
  Search, 
  RefreshCw,
  PieChart as PieIcon,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { DepositModal } from '../wallet/DepositModal';
import { WithdrawModal } from '../wallet/WithdrawModal';
import { TransferModal } from '../wallet/TransferModal';
import { AddressBookModal } from '../wallet/AddressBookModal';
import { TransactionDetailModal } from '../wallet/TransactionDetailModal';
import { DepositRecord, WithdrawalRecord } from '../../types/wallet';

import { depositApi } from '../../api/deposits';
import { withdrawalApi } from '../../api/withdrawals';

export const AssetsView: React.FC = () => {
  const { 
    walletDetails, 
    deposits, 
    withdrawals, 
    internalTransfers,
    addressBook, 
    securityState,
    submitDeposit,
    submitWithdrawal,
    executeInternalTransfer,
    addAddressBookItem,
    deleteAddressBookItem,
    toggleAddressWhitelist,
    toggleAddressFavorite
  } = useUser();

  const { isDemoMode } = useDemoMode();

  // Active Sub-Wallet view tab
  const [activeSubAccount, setActiveSubAccount] = useState<'overview' | 'spot' | 'futures' | 'funding'>('overview');

  // Modal States
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState<boolean>(false);
  
  const [selectedSymbol, setSelectedSymbol] = useState<string>('USDT');
  const [selectedTx, setSelectedTx] = useState<{ record: DepositRecord | WithdrawalRecord; type: 'deposit' | 'withdrawal' } | null>(null);

  useOverlayRegistration('deposit-modal', isDepositOpen, () => setIsDepositOpen(false));
  useOverlayRegistration('withdraw-modal', isWithdrawOpen, () => setIsWithdrawOpen(false));
  useOverlayRegistration('transfer-modal', isTransferOpen, () => setIsTransferOpen(false));
  useOverlayRegistration('addressbook-modal', isAddressBookOpen, () => setIsAddressBookOpen(false));
  useOverlayRegistration('txdetail-modal', !!selectedTx, () => setSelectedTx(null));

  // Transaction History Filters
  const [historyTab, setHistoryTab] = useState<'all' | 'deposits' | 'withdrawals' | 'transfers'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Backend Data States
  const [liveDeposits, setLiveDeposits] = useState<DepositRecord[]>([]);
  const [liveWithdrawals, setLiveWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);

  const fetchLiveHistory = async () => {
    if (isDemoMode) return;
    setIsFetchingHistory(true);
    try {
      const [depRes, wthRes] = await Promise.all([
        depositApi.getDeposits(),
        withdrawalApi.getWithdrawals()
      ]);

      if (depRes.success && depRes.deposits) {
        const mappedDeps: any[] = depRes.deposits.map((d: any) => ({
          id: `DEP-${d.id}`,
          userId: 'USER',
          userName: 'Trader',
          userEmail: '',
          asset: d.asset,
          amount: Number(d.amount_expected),
          usdValue: Number(d.amount_expected),
          network: d.network || 'Unknown',
          txHash: d.tx_hash || 'N/A',
          depositAddress: d.deposit_address || 'N/A',
          status: d.status === 'APPROVED' ? 'Completed' : d.status === 'DENIED' ? 'Rejected' : 'Pending',
          createdAt: d.created_at,
          updatedAt: d.updated_at || d.created_at,
          notes: d.notes || ''
        }));
        setLiveDeposits(mappedDeps);
      }

      if (wthRes.success && wthRes.withdrawals) {
        const mappedWths: any[] = wthRes.withdrawals.map((w: any) => ({
          id: `WTH-${w.id}`,
          userId: 'USER',
          userName: 'Trader',
          userEmail: '',
          asset: w.asset,
          amount: Number(w.amount),
          fee: Number(w.fee),
          receiveAmount: Number(w.receive_amount),
          usdValue: Number(w.amount),
          network: w.network || 'Unknown',
          recipientAddress: w.recipient_address || 'N/A',
          addressNickname: w.address_nickname || '',
          isWhitelisted: false,
          status: w.status === 'APPROVED' || w.status === 'COMPLETED' ? 'Completed' : w.status === 'DENIED' || w.status === 'REJECTED' ? 'Rejected' : 'Pending',
          txHash: w.tx_hash || 'N/A',
          createdAt: w.created_at,
          updatedAt: w.updated_at || w.created_at,
          notes: w.notes || ''
        }));
        setLiveWithdrawals(mappedWths);
      }
    } catch (err) {
      console.error('Failed to fetch live transactions:', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchLiveHistory();
  }, [isDemoMode]);

  const activeDeposits = isDemoMode ? deposits : (liveDeposits.length > 0 ? liveDeposits : deposits);
  const activeWithdrawals = isDemoMode ? withdrawals : (liveWithdrawals.length > 0 ? liveWithdrawals : withdrawals);

  // Portfolio Totals Math
  const totalSpotValue = walletDetails.reduce((acc, a) => acc + (a.spotBalance * a.priceUsdt), 0);
  const totalFuturesValue = walletDetails.reduce((acc, a) => acc + (a.futuresBalance * a.priceUsdt), 0);
  const totalFundingValue = walletDetails.reduce((acc, a) => acc + (a.fundingBalance * a.priceUsdt), 0);
  const totalLockedValue = walletDetails.reduce((acc, a) => acc + (a.lockedBalance * a.priceUsdt), 0);
  const totalUnrealizedPnL = walletDetails.reduce((acc, a) => acc + a.unrealizedPnL, 0);

  const totalPortfolioValue = totalSpotValue + totalFuturesValue + totalFundingValue + totalLockedValue;
  const totalAvailableValue = totalSpotValue + totalFuturesValue + totalFundingValue;

  const currentTabBalance = 
    activeSubAccount === 'spot' ? totalSpotValue :
    activeSubAccount === 'futures' ? totalFuturesValue :
    activeSubAccount === 'funding' ? totalFundingValue :
    totalPortfolioValue;

  const combinedHistory = React.useMemo(() => {
    let list: Array<{ record: any; type: 'deposit' | 'withdrawal' | 'transfer'; date: string }> = [];

    if (historyTab === 'all' || historyTab === 'deposits') {
      activeDeposits.forEach(d => list.push({ record: d, type: 'deposit', date: d.createdAt }));
    }
    if (historyTab === 'all' || historyTab === 'withdrawals') {
      activeWithdrawals.forEach(w => list.push({ record: w, type: 'withdrawal', date: w.createdAt }));
    }
    if (historyTab === 'all' || historyTab === 'transfers') {
      internalTransfers.forEach(t => list.push({ record: t, type: 'transfer', date: t.createdAt }));
    }

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return list.filter(item => {
      const r = item.record;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesSymbol = (r.asset || '').toLowerCase().includes(q);
        const matchesId = (r.id || '').toLowerCase().includes(q);
        const matchesNetwork = (r.network || '').toLowerCase().includes(q);
        return matchesSymbol || matchesId || matchesNetwork;
      }
      return true;
    });
  }, [activeDeposits, activeWithdrawals, internalTransfers, historyTab, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Wallet Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-app pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                ORIVIANT ENTERPRISE VAULT
              </span>
              {securityState.isWalletFrozen && (
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30">
                  WALLET FROZEN
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-app">
              Wallet & Asset Management
            </h1>
            <p className="text-xs text-app-sec">
              Multi-chain deposits, institutional cold-storage withdrawals & internal transfers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedSymbol('USDT');
                setIsDepositOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Deposit</span>
            </button>

            <button
              onClick={() => {
                setSelectedSymbol('USDT');
                setIsWithdrawOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs border border-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>

            <button
              onClick={() => setIsAddressBookOpen(true)}
              className="p-2.5 rounded-xl bg-app-sub hover:bg-app-card text-app-sec hover:text-app border border-app transition-all cursor-pointer"
              title="Address Book"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Balance KPI Grid based on selected Tab */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-1">
            <span className="text-[10px] font-bold text-app-sec uppercase">
              {activeSubAccount.toUpperCase()} BALANCE
            </span>
            <div className="text-xl font-black text-app font-mono">
              ${currentTabBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">≈ {(currentTabBalance / 92450.8).toFixed(4)} BTC</span>
          </div>

          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-1">
            <span className="text-[10px] font-bold text-app-sec uppercase">Total Available</span>
            <div className="text-xl font-black text-emerald-500 font-mono">
              ${totalAvailableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-app-sec">Ready for trading / withdrawal</span>
          </div>

          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-1">
            <span className="text-[10px] font-bold text-app-sec uppercase">Locked / Frozen</span>
            <div className="text-xl font-black text-amber-500 font-mono">
              ${totalLockedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-app-sec">Pending orders & withdrawals</span>
          </div>

          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-1">
            <span className="text-[10px] font-bold text-app-sec uppercase">Unrealized PnL</span>
            <div className={`text-xl font-black font-mono ${totalUnrealizedPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)}
            </div>
            <span className="text-[10px] text-app-sec">Open Futures positions</span>
          </div>

          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-app-sec uppercase">Account Tier</span>
            <div className="text-xl font-black text-blue-400 font-mono">
              VIP LEVEL 2
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">0% Maker / 0.02% Taker</span>
          </div>

        </div>

        {/* Sub-Wallet Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-app pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: `Overview ($${totalPortfolioValue.toFixed(0)})`, icon: PieIcon },
            { id: 'spot', label: `Spot Wallet ($${totalSpotValue.toFixed(0)})`, icon: Wallet },
            { id: 'futures', label: `Futures Wallet ($${totalFuturesValue.toFixed(0)})`, icon: Layers },
            { id: 'funding', label: `Funding Wallet ($${totalFundingValue.toFixed(0)})`, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubAccount === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubAccount(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  active 
                    ? 'bg-accent text-white shadow-md shadow-accent/20' 
                    : 'bg-app-sub/60 text-app-sec hover:text-app hover:bg-app-sub'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Dynamic Asset Balances Table */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-app capitalize">{activeSubAccount} Asset Balances</h2>
            <p className="text-xs text-app-sec">
              {activeSubAccount === 'overview' 
                ? 'Consolidated view across Spot, Futures, and Funding sub-wallets' 
                : `Active balance holdings dedicated to your ${activeSubAccount} account`}
            </p>
          </div>
          <button
            onClick={() => setIsTransferOpen(true)}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Transfer Funds</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-bold text-app-sec uppercase">
                <th className="py-3 px-4">Asset</th>
                {activeSubAccount === 'overview' && (
                  <>
                    <th className="py-3 px-4">Spot</th>
                    <th className="py-3 px-4">Futures</th>
                    <th className="py-3 px-4">Funding</th>
                  </>
                )}
                {activeSubAccount !== 'overview' && (
                  <>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Locked / In-Trade</th>
                  </>
                )}
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/50 text-xs">
              {walletDetails.map((asset) => {
                const specificBal = 
                  activeSubAccount === 'spot' ? asset.spotBalance :
                  activeSubAccount === 'futures' ? asset.futuresBalance :
                  activeSubAccount === 'funding' ? asset.fundingBalance :
                  (asset.spotBalance + asset.futuresBalance + asset.fundingBalance);

                const totalVal = specificBal * asset.priceUsdt;

                return (
                  <tr key={asset.symbol} className="hover:bg-app-sub/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-app-sub flex items-center justify-center font-bold text-sm text-accent shrink-0 border border-app">
                          {asset.icon}
                        </div>
                        <div>
                          <div className="font-extrabold text-app flex items-center gap-1.5">
                            <span>{asset.symbol}</span>
                            <span className="text-[10px] text-app-sec font-mono">({asset.name})</span>
                          </div>
                          <div className="text-[10px] text-emerald-500 font-mono font-bold">
                            ${asset.priceUsdt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {activeSubAccount === 'overview' ? (
                      <>
                        <td className="py-4 px-4 font-mono font-bold text-app">
                          {asset.spotBalance} <span className="text-[10px] text-app-sec">{asset.symbol}</span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-app-sec">
                          {asset.futuresBalance} <span className="text-[10px] text-app-sec">{asset.symbol}</span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-app-sec">
                          {asset.fundingBalance} <span className="text-[10px] text-app-sec">{asset.symbol}</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 font-mono font-bold text-emerald-500">
                          {specificBal} <span className="text-[10px] text-app-sec">{asset.symbol}</span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-amber-500">
                          {activeSubAccount === 'spot' ? asset.lockedBalance : 0} <span className="text-[10px] text-app-sec">{asset.symbol}</span>
                        </td>
                      </>
                    )}

                    <td className="py-4 px-4 font-mono font-black text-app">
                      ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSymbol(asset.symbol);
                            setIsTransferOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-[11px] border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Transfer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Center */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-4">
          <div>
            <h2 className="text-base font-extrabold text-app flex items-center gap-2">
              Transaction Center
              {isFetchingHistory && <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />}
            </h2>
            <p className="text-xs text-app-sec">Real-time ledger of deposits, withdrawals, and internal transfers</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchLiveHistory}
              className="p-1.5 rounded-xl bg-app-sub border border-app text-app-sec hover:text-app transition-colors"
              title="Refresh Ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-app-sec" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tx ID or Coin..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app focus:outline-none focus:border-accent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-app-sub border border-app text-xs font-bold text-app"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending / Confirming</option>
              <option value="Under Review">Under Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Activity (${combinedHistory.length})` },
            { id: 'deposits', label: `Deposits (${activeDeposits.length})` },
            { id: 'withdrawals', label: `Withdrawals (${activeWithdrawals.length})` },
            { id: 'transfers', label: `Internal Transfers (${internalTransfers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHistoryTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyTab === tab.id
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-app-sub/40 text-app-sec hover:text-app'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2.5 px-4">Type / Tx ID</th>
                <th className="py-2.5 px-4">Asset</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Network / Path</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/50 text-xs font-mono">
              {combinedHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-app-sec font-sans text-xs">
                    No transactions matching selected filters.
                  </td>
                </tr>
              ) : (
                combinedHistory.map(({ record, type }) => {
                  const isDep = type === 'deposit';
                  const isWth = type === 'withdrawal';

                  return (
                    <tr key={record.id} className="hover:bg-app-sub/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg border ${
                            isDep ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            isWth ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {isDep ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                             isWth ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                             <ArrowRightLeft className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-extrabold text-app font-sans">{type.toUpperCase()}</div>
                            <div className="text-[10px] text-app-sec">{record.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-app">
                        {record.asset}
                      </td>

                      <td className={`py-3 px-4 font-black ${isDep ? 'text-emerald-500' : isWth ? 'text-rose-500' : 'text-purple-400'}`}>
                        {isDep ? '+' : isWth ? '-' : ''}{record.amount} {record.asset}
                      </td>

                      <td className="py-3 px-4 text-app-sec">
                        {type === 'transfer' ? `${record.fromWallet.toUpperCase()} ➔ ${record.toWallet.toUpperCase()}` : record.network}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          record.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-500' :
                          record.status === 'Pending' || record.status === 'Confirming' || record.status === 'Under Review' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-rose-500/15 text-rose-500'
                        }`}>
                          {record.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-app-sec text-[11px]">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        {type !== 'transfer' && (
                          <button
                            onClick={() => setSelectedTx({ record, type })}
                            className="px-2.5 py-1 rounded-lg bg-app-sub hover:bg-app-card text-accent font-bold text-xs border border-app transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        walletDetails={walletDetails}
        initialSymbol={selectedSymbol}
        onConfirmDeposit={submitDeposit}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        walletDetails={walletDetails}
        addressBook={addressBook}
        securityState={securityState}
        initialSymbol={selectedSymbol}
        onSubmitWithdrawal={submitWithdrawal}
        onOpenAddressBook={() => {
          setIsWithdrawOpen(false);
          setIsAddressBookOpen(true);
        }}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        walletDetails={walletDetails}
        onExecuteTransfer={executeInternalTransfer}
      />

      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
        addressBook={addressBook}
        onAddAddress={addAddressBookItem}
        onDeleteAddress={deleteAddressBookItem}
        onToggleWhitelist={toggleAddressWhitelist}
        onToggleFavorite={toggleAddressFavorite}
      />

      <TransactionDetailModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        record={selectedTx?.record || null}
        type={selectedTx?.type || 'deposit'}
      />

    </div>
  );
};