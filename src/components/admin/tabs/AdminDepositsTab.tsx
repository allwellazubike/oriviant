import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  AlertCircle, 
  X, 
  FileText,
  Download,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export interface DepositRecord {
  id: string;
  user: string;
  email: string;
  asset: string;
  amount: number;
  usdValue: number;
  network: string;
  txHash: string;
  depositAddress: string;
  status: 'Pending' | 'Under Review' | 'Processing' | 'Successful' | 'Rejected' | 'Failed' | 'Cancelled';
  date: string;
  time: string;
  proofUrl?: string;
  notes?: string;
}

export const AdminDepositsTab: React.FC = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([
    {
      id: 'DEP-90812',
      user: 'Alex Thompson',
      email: 'alex.t@oriviant.io',
      asset: 'USDT',
      amount: 15000,
      usdValue: 15000,
      network: 'TRC-20 (Tron)',
      txHash: '0x8f19...d2019a',
      depositAddress: 'TY9aX...4kL90',
      status: 'Pending',
      date: '2026-08-04',
      time: '18:42:10',
      proofUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400',
      notes: 'Initial high-tier USDT deposit via TRC20'
    },
    {
      id: 'DEP-90811',
      user: 'Sarah Jenkins',
      email: 's.jenkins@gmail.com',
      asset: 'BTC',
      amount: 0.85,
      usdValue: 80112.50,
      network: 'Bitcoin Native',
      txHash: '0x12a5...904bca',
      depositAddress: 'bc1q9...83jkl',
      status: 'Under Review',
      date: '2026-08-04',
      time: '17:15:00',
      notes: 'Whale tier deposit flagged for automated compliance verification'
    },
    {
      id: 'DEP-90810',
      user: 'David Kim',
      email: 'dkim_trader@yahoo.com',
      asset: 'ETH',
      amount: 4.5,
      usdValue: 15662.25,
      network: 'ERC-20 (Ethereum)',
      txHash: '0x4f88...711abc',
      depositAddress: '0x71C...91a20',
      status: 'Successful',
      date: '2026-08-04',
      time: '16:05:44',
      notes: 'Automated 12-block confirmation successful'
    },
    {
      id: 'DEP-90809',
      user: 'Elena Rostova',
      email: 'elena.rostova@proton.me',
      asset: 'USDT',
      amount: 50000,
      usdValue: 50000,
      network: 'ERC-20 (Ethereum)',
      txHash: '0x99bb...100cde',
      depositAddress: '0x88F...44199',
      status: 'Successful',
      date: '2026-08-04',
      time: '14:22:19'
    },
    {
      id: 'DEP-90808',
      user: 'Marcus Vance',
      email: 'marcus.vance@corp.net',
      asset: 'SOL',
      amount: 120,
      usdValue: 25752,
      network: 'Solana Native',
      txHash: '0x334a...554ef0',
      depositAddress: 'SoL99...22kll',
      status: 'Rejected',
      date: '2026-08-04',
      time: '11:10:05',
      notes: 'Mismatched TX hash signature on blockchain verification'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{ deposit: DepositRecord; targetStatus: DepositRecord['status'] } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: DepositRecord['status'], note?: string) => {
    setDeposits(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          notes: note || d.notes
        };
      }
      return d;
    }));
    showToast(`Deposit ${id} updated to ${newStatus}.`);
    setActionModal(null);
    setActionNotes('');
  };

  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = 
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    const matchesAsset = selectedAsset === 'ALL' || d.asset === selectedAsset;
    return matchesSearch && matchesStatus && matchesAsset;
  });

  const totalDepositedUSD = deposits.filter(d => d.status === 'Successful').reduce((acc, curr) => acc + curr.usdValue, 0);
  const pendingCount = deposits.filter(d => d.status === 'Pending' || d.status === 'Under Review' || d.status === 'Processing').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Total Approved Deposits</span>
          <div className="text-2xl font-black text-emerald-500">${totalDepositedUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-app-sec block">Verified Crypto & Fiat Inflows</span>
        </div>

        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Pending Approvals</span>
          <div className="text-2xl font-black text-amber-500">{pendingCount} Transactions</div>
          <span className="text-[10px] text-amber-500 font-bold block">Requires Executive Review</span>
        </div>

        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Supported Networks</span>
          <div className="text-2xl font-black text-app">14 Chains</div>
          <span className="text-[10px] text-app-sec block">TRC20, ERC20, SOL, BTC, BEP20</span>
        </div>

        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-1">
          <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Avg Settlement Time</span>
          <div className="text-2xl font-black text-accent">2.4 mins</div>
          <span className="text-[10px] text-emerald-500 font-bold block">Automated Hot Wallet Sync</span>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Deposit ID, user name, email, or TX hash..."
            className="w-full bg-app-sec border border-app rounded-2xl pl-10 pr-4 py-2.5 text-xs text-app placeholder-app-sec focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Processing">Processing</option>
            <option value="Successful">Successful</option>
            <option value="Rejected">Rejected</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
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
        </div>
      </div>

      {/* Deposits Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            <span>Deposit Ledger & Approval Management</span>
          </h3>
          <span className="text-xs text-app-sec">{filteredDeposits.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                <th className="pb-3 pl-2">Deposit ID</th>
                <th className="pb-3">User & Email</th>
                <th className="pb-3">Asset / Amount</th>
                <th className="pb-3">USD Value</th>
                <th className="pb-3">Network / TX Hash</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/60 text-xs font-medium">
              {filteredDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-app-sec/30 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-app text-xs">
                    {d.id}
                  </td>

                  <td className="py-3.5">
                    <div className="font-bold text-app">{d.user}</div>
                    <div className="text-[10px] text-app-sec">{d.email}</div>
                  </td>

                  <td className="py-3.5">
                    <div className="font-extrabold text-app">{d.amount} {d.asset}</div>
                    <div className="text-[10px] text-app-sec">{d.network}</div>
                  </td>

                  <td className="py-3.5 font-bold text-emerald-500 font-mono">
                    ${d.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5">
                    <div className="font-mono text-[11px] text-app-sec truncate max-w-[140px]">{d.txHash}</div>
                    {d.proofUrl && (
                      <button 
                        onClick={() => { setSelectedDeposit(d); setIsProofModalOpen(true); }}
                        className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" /> View Proof
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 text-app-sec text-[11px] font-mono">
                    {d.date} <span className="text-[10px]">{d.time}</span>
                  </td>

                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      d.status === 'Successful'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : d.status === 'Pending' || d.status === 'Under Review' || d.status === 'Processing'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActionModal({ deposit: d, targetStatus: 'Successful' })}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 transition-colors shadow-sm"
                        title="Approve Deposit"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setActionModal({ deposit: d, targetStatus: 'Rejected' })}
                        className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[11px] hover:bg-red-500/20 transition-colors"
                        title="Reject Deposit"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Status Change Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Confirm Deposit Action</span>
              </h3>
              <button onClick={() => setActionModal(null)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-app-sec/40 border border-app space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-app-sec">Deposit ID:</span>
                <span className="font-mono font-bold text-app">{actionModal.deposit.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">User:</span>
                <span className="font-bold text-app">{actionModal.deposit.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Amount:</span>
                <span className="font-black text-emerald-500">{actionModal.deposit.amount} {actionModal.deposit.asset} (${actionModal.deposit.usdValue.toLocaleString()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Target Status:</span>
                <span className={`font-extrabold uppercase ${actionModal.targetStatus === 'Successful' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {actionModal.targetStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-app-sec mb-1">Audit Log Internal Note (Optional)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Reason or ledger reference note..."
                rows={2}
                className="w-full bg-app-sec border border-app rounded-xl p-3 text-xs text-app focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(actionModal.deposit.id, actionModal.targetStatus, actionNotes)}
                className={`px-5 py-2 rounded-xl text-white font-extrabold text-xs shadow-md ${
                  actionModal.targetStatus === 'Successful' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm {actionModal.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {isProofModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-extrabold text-app">Deposit Payment Proof – {selectedDeposit.id}</h3>
              <button onClick={() => setIsProofModalOpen(false)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedDeposit.proofUrl ? (
              <img src={selectedDeposit.proofUrl} alt="Deposit Proof" className="w-full rounded-2xl border border-app object-cover max-h-80" />
            ) : (
              <div className="p-8 text-center text-xs text-app-sec">No receipt proof uploaded for this transaction.</div>
            )}
            <div className="text-xs text-app-sec">
              <p>TX Hash: <span className="font-mono text-app">{selectedDeposit.txHash}</span></p>
              <p>Deposit Address: <span className="font-mono text-app">{selectedDeposit.depositAddress}</span></p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
