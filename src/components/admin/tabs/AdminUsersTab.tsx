import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, X, RefreshCw, Ban, CheckCircle2, 
  Trash2, Eye, User, Lock, Mail, DollarSign, Activity, History, Key,
  ShieldAlert, Sliders, ArrowDownLeft, ArrowUpRight, UserPlus, Check, Edit, Globe, Laptop
} from 'lucide-react';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { adminApi } from '../../../api/admin';
import { apiClient } from '../../../api/client';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  accountType: 'Live' | 'Demo';
  kycLevel: 'Unverified' | 'Level 1' | 'Level 2 Verified';
  status: 'Active' | 'Suspended' | 'Banned';
  demoBalance: number;
  realBalance: number;
  lastLogin: string;
  ip: string;
  joinDate: string;
  referralsCount: number;
}

export const AdminUsersTab: React.FC = () => {
  const { refillDemoFunds } = useDemoMode();

  const [usersList, setUsersList] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended' | 'Banned' | 'Verified'>('All');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<'profile' | 'security' | 'history' | 'referrals'>('profile');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [adjustingBalanceUser, setAdjustingBalanceUser] = useState<MockUser | null>(null);
  const [newRealBalance, setNewRealBalance] = useState<number>(0);
  const [newDemoBalance, setNewDemoBalance] = useState<number>(10000);
  
  // FIX: Custom Delete Modal State
  const [userToDelete, setUserToDelete] = useState<MockUser | null>(null);

  const [ledgerLogs, setLedgerLogs] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ activeTraders: 0, earnedUsdt: 0 });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers();

      const rawList = Array.isArray(res) ? res : (res as any).data || (res as any).users || [];

      if (rawList && Array.isArray(rawList)) {
        const mappedUsers: MockUser[] = rawList.map((u: any) => {

          let totalRealBalance = 0;
          if (Array.isArray(u.holdings)) {
            totalRealBalance = u.holdings.reduce((sum: number, h: any) => sum + Number(h.balance || 0), 0);
          } else {
            totalRealBalance = Number(u.real_balance) || 0;
          }

          return {
            id: u.id?.toString() || Math.random().toString(),
            name: u.nickname || u.name || 'Trader',
            email: u.email || 'No Email',
            accountType: u.account_type || 'Live',
            kycLevel: u.kyc_level || 'Level 1 Basic', 
            status: u.is_suspended ? 'Suspended' : (u.status || 'Active'),
            demoBalance: Number(u.demo_balance) || 10000,
            realBalance: totalRealBalance,
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Recently Active',
            ip: u.last_ip || 'Secure',
            joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : 'Unknown',
            referralsCount: Number(u.referrals_count) || 0
          };
        });
        setUsersList(mappedUsers);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load live users from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!selectedUser) return;
    
    if (activeUserTab === 'history') {
      apiClient<{success: boolean, data: any[]}>(`/admin/users/${selectedUser.id}/ledger`, { method: 'GET' })
        .then(res => {
          if (res.success) setLedgerLogs(res.data || []);
        })
        .catch(() => setLedgerLogs([]));
    }
    
    if (activeUserTab === 'referrals') {
      apiClient<{success: boolean, data: {activeTraders: number, earnedUsdt: number}}>(`/admin/users/${selectedUser.id}/referrals`, { method: 'GET' })
        .then(res => {
          if (res.success && res.data) setReferralStats(res.data);
        })
        .catch(err => console.error(err));
    }
  }, [selectedUser, activeUserTab]);

  const handleToggleStatus = async (id: string, newStatus: MockUser['status']) => {
    try {
      await adminApi.updateUserStatus(id, newStatus);

      setUsersList(prev => prev.map(u => {
        if (u.id === id) {
          showToast(`Account #${u.id} (${u.name}) set to ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      }));

      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.');
    }
  };

  const handleKycAction = async (id: string, approve: boolean) => {
    const nextKyc: MockUser['kycLevel'] = approve ? 'Level 2 Verified' : 'Unverified';
    try {
      await adminApi.updateKycLevel(id, nextKyc);

      setUsersList(prev => prev.map(u => u.id === id ? { ...u, kycLevel: nextKyc } : u));
      showToast(`KYC for user #${id} set to ${nextKyc}.`);

      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, kycLevel: nextKyc } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update KYC level.');
    }
  };

  const handleResetDemoBalance = async (user: MockUser) => {
    try {
      await adminApi.updateUserBalance(user.id, user.realBalance, 10000);

      refillDemoFunds(10000);
      setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, demoBalance: 10000 } : u));
      showToast(`Refilled demo balance for ${user.name} to $10,000 USDT.`);

      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, demoBalance: 10000 } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo balance.');
    }
  };

  const handleSaveBalanceAdjust = async () => {
    if (!adjustingBalanceUser) return;

    try {
      await adminApi.updateUserBalance(adjustingBalanceUser.id, newRealBalance, newDemoBalance);

      setUsersList(prev => prev.map(u => u.id === adjustingBalanceUser.id ? {
        ...u,
        realBalance: newRealBalance,
        demoBalance: newDemoBalance
      } : u));

      showToast(`Balances updated for user #${adjustingBalanceUser.id}`);
      setAdjustingBalanceUser(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user balances.');
    }
  };

  const handleResetPassword = async (user: MockUser) => {
    try {
      await adminApi.resetUserPassword(user.id);
      showToast(`Temporary password reset link generated and sent to ${user.email}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate reset link.');
    }
  };

  // FIX: New Custom Delete Confirmation Logic
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await adminApi.deleteUser(userToDelete.id);

      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
      showToast(`User account #${userToDelete.id} (${userToDelete.name}) deleted successfully.`);
      if (selectedUser?.id === userToDelete.id) setSelectedUser(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user.');
    } finally {
      setUserToDelete(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.id.includes(searchQuery);
    if (!matchesSearch) return false;
    if (filterStatus === 'Active') return u.status === 'Active';
    if (filterStatus === 'Suspended') return u.status === 'Suspended';
    if (filterStatus === 'Banned') return u.status === 'Banned';
    if (filterStatus === 'Verified') return u.kycLevel === 'Level 2 Verified';
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Controls: Search & Filter */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email or UID..."
            className="w-full bg-app-sec border border-app rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(['All', 'Active', 'Suspended', 'Banned', 'Verified'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Users Desktop Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span>Master User Directory ({filteredUsers.length} Registered Accounts)</span>
          </h3>
          <button 
            onClick={fetchUsers} 
            className="p-2 rounded-xl bg-app-sec text-app hover:bg-app-sec/80 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                <th className="pb-3 pl-2">User & Email</th>
                <th className="pb-3">UID</th>
                <th className="pb-3">KYC Status</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3">Live Wallet</th>
                <th className="pb-3">Demo Funds</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/60 text-xs font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-app-sec">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-app-sec border-t-accent animate-spin" />
                      <p className="text-xs font-bold">Querying User Database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-app-sec">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-app-sec/30 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-app block">{u.name}</span>
                          <span className="text-[10px] text-app-sec">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono text-app font-bold">#{u.id}</td>

                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        u.kycLevel === 'Level 2 Verified'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {u.kycLevel}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                        u.status === 'Suspended' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 font-bold text-app font-mono">
                      ${u.realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                    </td>

                    <td className="py-3.5 font-bold text-emerald-500 font-mono">
                      ${u.demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
                    </td>

                    <td className="py-3.5 text-app-sec text-[11px] font-mono">
                      {u.lastLogin}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedUser(u); setActiveUserTab('profile'); }}
                          className="p-1.5 rounded-lg bg-app-sec text-app hover:bg-app-sec/80 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingBalanceUser(u);
                            setNewRealBalance(u.realBalance);
                            setNewDemoBalance(u.demoBalance);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                          title="Adjust Wallet Balances"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResetDemoBalance(u)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                          title="Reset Demo Funds to $10k"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.id, u.status === 'Active' ? 'Suspended' : 'Active')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'Active'
                              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                          title={u.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {u.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {adjustingBalanceUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-extrabold text-app">Adjust Balances – #{adjustingBalanceUser.id}</h3>
              <button onClick={() => setAdjustingBalanceUser(null)} className="p-1 text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-app-sec mb-1">Live Real Wallet Balance (USDT)</label>
                <input
                  type="number"
                  value={newRealBalance}
                  onChange={(e) => setNewRealBalance(Number(e.target.value))}
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs font-bold text-app font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-app-sec mb-1">Demo Virtual Balance (USDT)</label>
                <input
                  type="number"
                  value={newDemoBalance}
                  onChange={(e) => setNewDemoBalance(Number(e.target.value))}
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
              <button onClick={() => setAdjustingBalanceUser(null)} className="px-4 py-2 rounded-xl bg-app-sec text-app-sec font-bold text-xs hover:bg-app-sec/80">
                Cancel
              </button>
              <button onClick={handleSaveBalanceAdjust} className="px-4 py-2 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md hover:bg-amber-600">
                Save Adjustments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-app">Delete Account?</h3>
              <p className="text-xs text-app-sec mt-2 leading-relaxed">
                Are you absolutely sure you want to permanently delete <strong className="text-app">{userToDelete.name}</strong> (UID #{userToDelete.id})? This action will destroy all their wallets, ledgers, and trade history. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-app-sec text-app font-bold text-xs hover:bg-app-sec/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Full Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center uppercase">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-app">{selectedUser.name}</h3>
                  <span className="text-xs text-app-sec">UID #{selectedUser.id} • Joined {selectedUser.joinDate}</span>
                </div>
              </div>

              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-2 border-b border-app pb-2">
              <button
                onClick={() => setActiveUserTab('profile')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl ${activeUserTab === 'profile' ? 'bg-amber-500 text-white' : 'bg-app-sec text-app-sec'}`}
              >
                Profile & KYC
              </button>
              <button
                onClick={() => setActiveUserTab('security')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl ${activeUserTab === 'security' ? 'bg-amber-500 text-white' : 'bg-app-sec text-app-sec'}`}
              >
                Security & Sessions
              </button>
              <button
                onClick={() => setActiveUserTab('history')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl ${activeUserTab === 'history' ? 'bg-amber-500 text-white' : 'bg-app-sec text-app-sec'}`}
              >
                Trading & Ledger
              </button>
              <button
                onClick={() => setActiveUserTab('referrals')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl ${activeUserTab === 'referrals' ? 'bg-amber-500 text-white' : 'bg-app-sec text-app-sec'}`}
              >
                Referrals ({selectedUser.referralsCount})
              </button>
            </div>

            {/* Tab Content */}
            {activeUserTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-app-sec/40 border border-app">
                  <div>
                    <span className="text-app-sec block text-[10px]">Email Address</span>
                    <span className="font-bold text-app">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-app-sec block text-[10px]">Account Status</span>
                    <span className={`font-black ${selectedUser.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedUser.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-app-sec/40 border border-app">
                  <div>
                    <span className="text-app-sec block text-[10px]">Live Real Wallet Balance</span>
                    <span className="font-bold text-app font-mono">${selectedUser.realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
                  </div>
                  <div>
                    <span className="text-app-sec block text-[10px]">Simulator Demo Funds</span>
                    <span className="font-bold text-emerald-500 font-mono">${selectedUser.demoBalance.toLocaleString()} USDT</span>
                  </div>
                </div>

                {/* KYC Control Actions */}
                <div className="p-4 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-app">KYC Status: <strong className="text-emerald-500">{selectedUser.kycLevel}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleKycAction(selectedUser.id, true)}
                        className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Approve KYC 2
                      </button>
                      <button
                        onClick={() => handleKycAction(selectedUser.id, false)}
                        className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[11px]"
                      >
                        Revoke KYC
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeUserTab === 'security' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                  <span className="font-bold text-app block">Recent Session IP & Device</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>IP Address: <strong className="text-amber-500">{selectedUser.ip}</strong></div>
                    <div>Last Active: <strong className="text-app">{selectedUser.lastLogin}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetPassword(selectedUser)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Key className="w-4 h-4" /> Reset Password
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id, 'Banned')}
                    className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" /> Ban Account
                  </button>
                </div>
              </div>
            )}

            {activeUserTab === 'history' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                  <span className="font-bold text-app block">Recent Trading Activity</span>
                  
                  {ledgerLogs.length === 0 ? (
                    <div className="py-4 text-center text-app-sec">No recent trading activity found for this user.</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {ledgerLogs.map((log: any, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-app-card border border-app/50">
                           <div className="flex flex-col">
                             <span className="font-bold text-app">{log.reason || 'TRADE_EXECUTED'}</span>
                             <span className="text-[9px] text-app-sec">{new Date(log.created_at || Date.now()).toLocaleString()}</span>
                           </div>
                           <div className="text-right">
                             <span className={`font-mono font-bold block ${Number(log.delta) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                               {Number(log.delta) > 0 ? '+' : ''}{Number(log.delta).toFixed(2)} {log.asset_symbol || 'USDT'}
                             </span>
                             <span className="text-[10px] text-app-sec font-mono">Bal: {Number(log.balance_after).toFixed(2)}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeUserTab === 'referrals' && (
              <div className="p-4 rounded-2xl bg-app-sec/40 border border-app text-xs space-y-2">
                <span className="font-bold text-app block">Affiliate Referral Network</span>
                <p className="text-app-sec">This user has referred <strong className="text-app">{referralStats.activeTraders} active traders</strong> and earned <strong className="text-emerald-500">${referralStats.earnedUsdt} USDT</strong> in fee shares.</p>
              </div>
            )}

            {/* Footer Controls */}
            <div className="pt-3 border-t border-app flex items-center justify-between">
              <button
                onClick={() => handleResetDemoBalance(selectedUser)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600"
              >
                Reset Demo Balance to $10k
              </button>

              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 rounded-xl bg-app-sec text-app font-bold text-xs hover:bg-app-sec/80">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};