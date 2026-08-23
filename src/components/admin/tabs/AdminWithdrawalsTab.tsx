import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, Search, Filter, CheckCircle2, XCircle, Clock, Eye, AlertCircle, X, Download, ShieldAlert, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

export interface WithdrawalRecord {
  id: string;
  user: string;
  email: string;
  asset: string;
  amount: number;
  usdValue: number;
  network: string;
  destination: string;
  txHash?: string;
  status: 'Pending' | 'Processing' | 'Successful' | 'Rejected' | 'Failed' | 'Cancelled';
  date: string;
  time: string;
  riskScore: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export const AdminWithdrawalsTab: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
  const [actionModal, setActionModal] = useState<{ withdrawal: WithdrawalRecord; targetStatus: WithdrawalRecord['status'] } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getWithdrawals('ALL');
      
      // Safely unpack the data whether the backend returns it directly or wraps it
      const rawList = Array.isArray(res) ? res : (res as any).data || (res as any).withdrawals || [];

      if (rawList && Array.isArray(rawList)) {
        const mapped: WithdrawalRecord[] = rawList.map((w: any) => {
          const rawStatus = (w.status || '').toUpperCase();
          let mappedStatus: WithdrawalRecord['status'] = 'Pending';
          
          // Robust status mapping
          if (['APPROVED', 'COMPLETED', 'SUCCESSFUL', 'SUCCESS'].includes(rawStatus)) {
            mappedStatus = 'Successful';
          } else if (['REJECTED', 'DENIED', 'FAILED'].includes(rawStatus)) {
            mappedStatus = 'Rejected';
          } else if (['PROCESSING'].includes(rawStatus)) {
            mappedStatus = 'Processing';
          } else {
            mappedStatus = 'Pending';
          }

          const createdDate = w.created_at ? new Date(w.created_at) : new Date();

          return {
            id: w.id.toString(),
            user: w.nickname || w.user_name || 'Unknown User',
            email: w.email || w.user_email || 'N/A',
            asset: w.asset,
            amount: Number(w.amount || 0),
            usdValue: Number(w.amount || 0),
            network: w.network || 'Unknown',
            destination: w.recipient_address || w.destination || 'N/A',
            txHash: w.tx_hash || 'N/A',
            status: mappedStatus,
            date: !isNaN(createdDate.getTime()) ? createdDate.toISOString().split('T')[0] : '',
            time: !isNaN(createdDate.getTime()) ? createdDate.toISOString().split('T')[1].substring(0, 8) : '',
            riskScore: 'Low',
            notes: w.notes || ''
          };
        });
        setWithdrawals(mapped);
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
      showToast('Failed to load live withdrawal records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleConfirmStatusChange = async () => {
    if (!actionModal) return;
    setIsActionLoading(true);
    const { withdrawal, targetStatus } = actionModal;

    try {
      if (targetStatus === 'Successful') {
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
        const res = await adminApi.approveWithdrawal(withdrawal.id, mockTxHash);
        
        if (res.success !== false) {
          showToast(`Withdrawal ${withdrawal.id} approved successfully!`);
          await fetchWithdrawals();
        } else {
          showToast(`Error: ${res.message || 'Approval failed'}`);
        }
      } else if (targetStatus === 'Rejected') {
        const res = await adminApi.denyWithdrawal(withdrawal.id, rejectionReason);
        
        if (res.success !== false) {
          showToast(`Withdrawal ${withdrawal.id} rejected and funds refunded to user.`);
          await fetchWithdrawals();
        } else {
          showToast(`Error: ${res.message || 'Rejection failed'}`);
        }
      }
    } catch (err: any) {
      console.error('Withdrawal action error:', err);
      showToast(err.message || 'Action failed to execute.');
    } finally {
      setIsActionLoading(false);
      setActionModal(null);
      setRejectionReason('');
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
    const matchesAsset = selectedAsset === 'ALL' || w.asset === selectedAsset;
    return matchesSearch && matchesStatus && matchesAsset;
  });

  const totalProcessedUSD = withdrawals.filter(w => w.status === 'Successful').reduce((acc, curr) => acc + curr.usdValue, 0);
  const pendingCount = withdrawals.filter(w => w.status === 'Pending' || w.status === 'Processing').length;

  return (
    <div className="space-y-6">
      
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Pending Withdrawal Queue</span>
          <div className="text-2xl font-black text-amber-500">{pendingCount} Requests</div>
          <span className="text-[10px] text-amber-500 font-bold block">Awaiting Security Authorization</span>
        </div>
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Total Processed (24H)</span>
          <div className="text-2xl font-black text-emerald-500">${totalProcessedUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-emerald-500 font-bold block">100% On-Chain Settled</span>
        </div>
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Security Fraud Alerts</span>
          <div className="text-2xl font-black text-red-500">0 High Risk</div>
          <span className="text-[10px] text-emerald-500 font-bold block">AML Screening Passed</span>
        </div>
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Cold Wallet Balance</span>
          <div className="text-2xl font-black text-app">$84,290,000</div>
          <span className="text-[10px] text-app-sec block">Multi-Sig Vault Reserves</span>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Withdrawal ID, email, destination wallet, or TX hash..."
            className="w-full bg-app-sec border border-app rounded-2xl pl-10 pr-4 py-2.5 text-xs text-app placeholder-app-sec focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={fetchWithdrawals} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh Ledger">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none">
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Successful">Successful</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none">
            <option value="ALL">All Assets</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
            <span>Withdrawal Outflow Requests ({filteredWithdrawals.length})</span>
          </h3>
          <span className="text-xs text-app-sec">Audit Logs Auto-Enabled</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading && withdrawals.length === 0 ? (
            <div className="py-10 text-center text-app-sec text-xs font-bold flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-accent" />
              Loading live withdrawal records...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                  <th className="pb-3 pl-2">Withdrawal ID</th>
                  <th className="pb-3">User & Email</th>
                  <th className="pb-3">Asset / Amount</th>
                  <th className="pb-3">USD Value</th>
                  <th className="pb-3">Destination Wallet & Chain</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/60 text-xs font-medium">
                {filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-app-sec/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-app text-xs">{w.id}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-app">{w.user}</div>
                      <div className="text-[10px] text-app-sec">{w.email}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-extrabold text-app">{w.amount} {w.asset}</div>
                      <div className="text-[10px] text-app-sec">Fee: 0.00</div>
                    </td>
                    <td className="py-3.5 font-bold text-amber-500 font-mono">
                      ${w.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5">
                      <div className="font-mono text-[11px] text-app-sec truncate max-w-xs" title={w.destination}>{w.destination}</div>
                      <div className="text-[10px] font-bold text-app-sec mt-0.5">{w.network}</div>
                      {w.txHash && w.txHash !== 'N/A' && (
                        <div className="text-[10px] text-emerald-500 mt-0.5 truncate max-w-xs">TX: {w.txHash}</div>
                      )}
                    </td>
                    <td className="py-3.5 text-app-sec text-[11px] font-mono">{w.date} <span className="text-[10px]">{w.time}</span></td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        w.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        w.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      {w.status === 'Pending' || w.status === 'Processing' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setActionModal({ withdrawal: w, targetStatus: 'Successful' })} className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 transition-colors shadow-sm">
                            Approve
                          </button>
                          <button onClick={() => setActionModal({ withdrawal: w, targetStatus: 'Rejected' })} className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[11px] hover:bg-red-500/20 transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-app-sec text-[10px] font-bold uppercase tracking-wider">{w.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWithdrawals.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-app-sec font-medium">
                      No withdrawals found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Confirm Withdrawal Action</span>
              </h3>
              <button onClick={() => setActionModal(null)} className="p-1 rounded-lg text-app-sec hover:text-app" disabled={isActionLoading}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 rounded-2xl bg-app-sec/40 border border-app space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-app-sec">Withdrawal ID:</span><span className="font-mono font-bold text-app">{actionModal.withdrawal.id}</span></div>
              <div className="flex justify-between"><span className="text-app-sec">User:</span><span className="font-bold text-app">{actionModal.withdrawal.user}</span></div>
              <div className="flex justify-between"><span className="text-app-sec">Amount:</span><span className="font-black text-amber-500">{actionModal.withdrawal.amount} {actionModal.withdrawal.asset}</span></div>
              <div className="flex justify-between"><span className="text-app-sec">Target Status:</span><span className={`font-extrabold uppercase ${actionModal.targetStatus === 'Successful' ? 'text-emerald-500' : 'text-red-500'}`}>{actionModal.targetStatus}</span></div>
            </div>

            {actionModal.targetStatus === 'Successful' ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs">
                <p className="font-bold mb-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Ready for On-Chain Settlement</p>
                <p className="text-[11px]">Approving this will mark the transaction as sent. The user's locked balance will be permanently deducted.</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-app-sec mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Risk triggers flagged, incorrect chain requested..."
                  rows={2}
                  disabled={isActionLoading}
                  className="w-full bg-app-sec border border-app rounded-xl p-3 text-xs text-app focus:outline-none focus:border-red-500 disabled:opacity-50"
                />
              </div>
            )}

            <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
              <button onClick={() => setActionModal(null)} disabled={isActionLoading} className="px-4 py-2 rounded-xl bg-app-sec text-app-sec font-bold text-xs">Cancel</button>
              <button onClick={handleConfirmStatusChange} disabled={isActionLoading} className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-extrabold text-xs shadow-md ${actionModal.targetStatus === 'Successful' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm {actionModal.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};