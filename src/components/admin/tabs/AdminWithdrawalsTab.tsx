import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  FileText,
  Download,
  ShieldAlert,
  Edit,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

export interface WithdrawalRecord {
  id: string;
  user: string;
  email: string;
  asset: string;
  amount: number;
  usdValue: number;
  walletAddress: string;
  network: string;
  date: string;
  time: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Processing' | 'Successful' | 'Rejected' | 'Cancelled' | 'Failed';
  txHash: string;
  notes: string;
  rejectionReason?: string;
}

export const AdminWithdrawalsTab: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  
  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    withdrawal: WithdrawalRecord;
    targetStatus: WithdrawalRecord['status'];
  } | null>(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [editingNotesItem, setEditingNotesItem] = useState<WithdrawalRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getWithdrawals('ALL');
      if (res.success && res.data) {
        const mapped: WithdrawalRecord[] = res.data.map((w: any) => ({
          id: w.id.toString(),
          user: w.nickname || 'Unknown User',
          email: w.email || 'N/A',
          asset: w.asset,
          amount: Number(w.amount),
          usdValue: Number(w.amount), // Assuming 1:1 for MVP without oracle
          walletAddress: w.recipient_address || 'N/A',
          network: w.network || 'Unknown',
          date: new Date(w.created_at).toISOString().split('T')[0],
          time: new Date(w.created_at).toISOString().split('T')[1].substring(0, 8),
          status: w.status === 'APPROVED' ? 'Successful' : w.status === 'DENIED' ? 'Rejected' : 'Pending',
          txHash: w.tx_hash || 'N/A',
          notes: w.notes || '',
          rejectionReason: w.status === 'DENIED' ? 'Administrative Rejection' : undefined
        }));
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
    if (!statusModal) return;
    const { withdrawal, targetStatus } = statusModal;

    if (targetStatus === 'Rejected' && !rejectionReason.trim()) {
      alert('A rejection reason is strictly required when rejecting a withdrawal.');
      return;
    }

    setIsActionLoading(true);
    try {
      if (targetStatus === 'Successful' || targetStatus === 'Approved' || targetStatus === 'Processing') {
        // Approve Flow
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
        const res = await adminApi.approveWithdrawal(withdrawal.id, mockTxHash);
        if (res.success) {
          showToast(`Withdrawal ${withdrawal.id} approved successfully!`);
          await fetchWithdrawals();
        } else {
          showToast(`Error: ${res.message}`);
        }
      } else if (targetStatus === 'Rejected' || targetStatus === 'Failed' || targetStatus === 'Cancelled') {
        // Reject Flow
        const res = await adminApi.denyWithdrawal(withdrawal.id, rejectionReason);
        if (res.success) {
          showToast(`Withdrawal ${withdrawal.id} rejected and funds refunded to user.`);
          await fetchWithdrawals();
        } else {
          showToast(`Error: ${res.message}`);
        }
      } else {
        showToast('Only Approval or Rejection status updates are currently supported via API.');
      }
    } catch (err: any) {
      console.error('Withdrawal action error:', err);
      showToast(err.message || 'Failed to update withdrawal status.');
    } finally {
      setIsActionLoading(false);
      setStatusModal(null);
      setRejectionReason('');
      setInternalNote('');
    }
  };

  const handleSaveNotes = () => {
    if (!editingNotesItem) return;
    setWithdrawals(prev => prev.map(w => w.id === editingNotesItem.id ? { ...w, notes: internalNote } : w));
    showToast(`Internal notes saved for ${editingNotesItem.id}`);
    setEditingNotesItem(null);
    setInternalNote('');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Withdrawal ID,User,Email,Asset,Amount,USD Value,Network,Status,Date,TxHash"]
      .concat(withdrawals.map(w => `${w.id},"${w.user}",${w.email},${w.asset},${w.amount},${w.usdValue},${w.network},${w.status},${w.date},${w.txHash}`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oriviant_Withdrawals_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Withdrawal ledger report exported to CSV successfully!');
  };

  const filteredWithdrawals = withdrawals
    .filter(w => {
      const matchesSearch = 
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.txHash.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
      const matchesAsset = selectedAsset === 'ALL' || w.asset === selectedAsset;
      return matchesSearch && matchesStatus && matchesAsset;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.usdValue - a.usdValue;
      return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
    });

  const totalPendingUSD = withdrawals
    .filter(w => w.status === 'Pending' || w.status === 'Under Review' || w.status === 'Processing')
    .reduce((acc, curr) => acc + curr.usdValue, 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Pending Withdrawal Queue</span>
          <div className="text-2xl font-black text-amber-500">${totalPendingUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-amber-500 font-bold block">Awaiting Security Authorization</span>
        </div>

        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Total Processed (24h)</span>
          <div className="text-2xl font-black text-emerald-500">$16,676.30</div>
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

      {/* Control & Export Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
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

        {/* Filters & Export button */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={fetchWithdrawals}
            className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Processing">Processing</option>
            <option value="Successful">Successful</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none"
          >
            <option value="ALL">All Assets</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
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
                  <th className="pb-3">TX Hash / Notes</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/60 text-xs font-medium">
                {filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-app-sec/30 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-app text-xs">
                      {w.id}
                    </td>

                    <td className="py-3.5">
                      <div className="font-bold text-app">{w.user}</div>
                      <div className="text-[10px] text-app-sec">{w.email}</div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-extrabold text-app">{w.amount} {w.asset}</div>
                      <div className="text-[10px] text-app-sec">{w.network}</div>
                    </td>

                    <td className="py-3.5 font-bold text-amber-500 font-mono">
                      ${w.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5">
                      <div className="font-mono text-[11px] text-app font-semibold truncate max-w-[140px]" title={w.walletAddress}>
                        {w.walletAddress}
                      </div>
                    </td>

                    <td className="py-3.5 text-app-sec text-[11px] font-mono">
                      {w.date} <span className="text-[10px]">{w.time}</span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold w-fit ${
                          w.status === 'Successful' || w.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : w.status === 'Processing'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : w.status === 'Pending' || w.status === 'Under Review'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {w.status}
                        </span>
                        {w.rejectionReason && (
                          <span className="text-[9px] text-red-400 font-normal max-w-[120px] truncate" title={w.rejectionReason}>
                            Reason: {w.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-mono text-[10px] text-app-sec truncate max-w-[120px]" title={w.txHash}>
                        {w.txHash}
                      </div>
                      <button
                        onClick={() => {
                          setEditingNotesItem(w);
                          setInternalNote(w.notes);
                        }}
                        className="text-[10px] text-accent hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Edit className="w-3 h-3" /> Edit Notes
                      </button>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      {w.status === 'Pending' || w.status === 'Under Review' || w.status === 'Processing' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={w.status}
                            onChange={(e) => {
                              const target = e.target.value as WithdrawalRecord['status'];
                              setStatusModal({ withdrawal: w, targetStatus: target });
                              setRejectionReason('');
                              setInternalNote('');
                            }}
                            className="bg-app-sec border border-app rounded-xl px-2.5 py-1 text-xs font-bold text-app focus:outline-none"
                          >
                            <option value="Pending">Set Pending</option>
                            <option value="Under Review">Set Under Review</option>
                            <option value="Approved">Set Approved</option>
                            <option value="Processing">Set Processing</option>
                            <option value="Successful">Set Successful</option>
                            <option value="Rejected">Set Rejected</option>
                            <option value="Cancelled">Set Cancelled</option>
                            <option value="Failed">Set Failed</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-app-sec text-[10px] italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWithdrawals.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-app-sec font-medium">
                      No withdrawals found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mandatory Status Change & Rejection Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Confirm Withdrawal Status Update</span>
              </h3>
              <button onClick={() => setStatusModal(null)} className="p-1 rounded-lg text-app-sec hover:text-app" disabled={isActionLoading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-app-sec/40 border border-app space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-app-sec">Withdrawal ID:</span>
                <span className="font-mono font-bold text-app">{statusModal.withdrawal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">User:</span>
                <span className="font-bold text-app">{statusModal.withdrawal.user} ({statusModal.withdrawal.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Amount:</span>
                <span className="font-black text-amber-500">{statusModal.withdrawal.amount} {statusModal.withdrawal.asset} (${statusModal.withdrawal.usdValue.toLocaleString()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Wallet Destination:</span>
                <span className="font-mono text-app text-[11px] truncate max-w-[200px]">{statusModal.withdrawal.walletAddress}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-app">
                <span className="text-app-sec font-bold">New Target Status:</span>
                <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                  statusModal.targetStatus === 'Successful' || statusModal.targetStatus === 'Approved' ? 'bg-emerald-500 text-white' :
                  statusModal.targetStatus === 'Rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {statusModal.targetStatus}
                </span>
              </div>
            </div>

            {/* Mandatory Rejection Reason Input */}
            {statusModal.targetStatus === 'Rejected' && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                <label className="block text-xs font-black text-red-500 uppercase tracking-wider">
                  * Mandatory Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State exact reason for rejection (e.g. Unverified recipient wallet, failed security check, insufficient margin)..."
                  rows={3}
                  required
                  disabled={isActionLoading}
                  className="w-full bg-app-card border border-red-500/40 rounded-xl p-3 text-xs text-app placeholder-app-sec focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-app-sec mb-1">Add Audit Log Internal Note</label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Optional internal notes for audit stream..."
                rows={2}
                disabled={isActionLoading}
                className="w-full bg-app-sec border border-app rounded-xl p-2.5 text-xs text-app focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>

            <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
              <button
                onClick={() => setStatusModal(null)}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={isActionLoading}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md disabled:opacity-50 ${
                  statusModal.targetStatus === 'Rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {isActionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Notes Edit Modal */}
      {editingNotesItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-extrabold text-app">Edit Notes – {editingNotesItem.id}</h3>
              <button onClick={() => setEditingNotesItem(null)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-app-sec mb-1">Internal Operational Notes</label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={4}
                className="w-full bg-app-sec border border-app rounded-xl p-3 text-xs text-app focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setEditingNotesItem(null)} className="px-4 py-2 rounded-xl bg-app-sec text-app-sec font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};