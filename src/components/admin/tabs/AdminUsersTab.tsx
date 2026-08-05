import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Ban, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  User, 
  Lock, 
  Mail, 
  DollarSign, 
  Activity,
  History
} from 'lucide-react';
import { useDemoMode } from '../../../contexts/DemoModeContext';

interface MockUser {
  id: string;
  name: string;
  email: string;
  accountType: 'Live' | 'Demo';
  kycLevel: 'Level 1' | 'Level 2 Verified';
  status: 'Active' | 'Suspended';
  demoBalance: number;
  realBalance: number;
  lastLogin: string;
  ip: string;
}

export const AdminUsersTab: React.FC = () => {
  const { refillDemoFunds } = useDemoMode();

  const [usersList, setUsersList] = useState<MockUser[]>([
    { id: '892014', name: 'Alex Thompson', email: 'alex.t@oriviant.io', accountType: 'Live', kycLevel: 'Level 2 Verified', status: 'Active', demoBalance: 10000, realBalance: 24500, lastLogin: '2 mins ago', ip: '185.220.101.5' },
    { id: '741290', name: 'Sarah Jenkins', email: 's.jenkins@gmail.com', accountType: 'Live', kycLevel: 'Level 2 Verified', status: 'Active', demoBalance: 10000, realBalance: 112000, lastLogin: '1 hour ago', ip: '82.165.197.1' },
    { id: '652811', name: 'David Kim', email: 'dkim_trader@yahoo.com', accountType: 'Demo', kycLevel: 'Level 1', status: 'Active', demoBalance: 10000, realBalance: 0, lastLogin: '3 hours ago', ip: '198.51.100.42' },
    { id: '910243', name: 'Elena Rostova', email: 'elena.rostova@proton.me', accountType: 'Live', kycLevel: 'Level 2 Verified', status: 'Active', demoBalance: 10000, realBalance: 580000, lastLogin: '5 mins ago', ip: '194.26.29.12' },
    { id: '310922', name: 'Marcus Vance', email: 'marcus.vance@corp.net', accountType: 'Demo', kycLevel: 'Level 1', status: 'Suspended', demoBalance: 1200, realBalance: 0, lastLogin: '3 days ago', ip: '203.0.113.88' },
    { id: '552109', name: 'Chloe Dubois', email: 'chloe.dubois@free.fr', accountType: 'Live', kycLevel: 'Level 2 Verified', status: 'Active', demoBalance: 10000, realBalance: 84200, lastLogin: '12 mins ago', ip: '51.15.222.10' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended' | 'Verified'>('All');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleSuspend = (id: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`Account #${u.id} (${u.name}) has been ${nextStatus.toLowerCase()}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleResetDemoBalance = (user: MockUser) => {
    refillDemoFunds(10000);
    setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, demoBalance: 10000 } : u));
    showToast(`Refilled demo balance for ${user.name} to $10,000 USDT.`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user account ${name} (#${id})?`)) {
      setUsersList(prev => prev.filter(u => u.id !== id));
      showToast(`User account #${id} (${name}) deleted successfully.`);
      if (selectedUser?.id === id) setSelectedUser(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.id.includes(searchQuery);
    if (!matchesSearch) return false;
    if (filterStatus === 'Active') return u.status === 'Active';
    if (filterStatus === 'Suspended') return u.status === 'Suspended';
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
          {(['All', 'Active', 'Suspended', 'Verified'] as const).map(st => (
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

      {/* Users Desktop Table / Mobile Cards */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span>User Directory ({filteredUsers.length} Users)</span>
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                <th className="pb-3 pl-2">User / Email</th>
                <th className="pb-3">UID</th>
                <th className="pb-3">KYC Status</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3">Demo Balance</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/60 text-xs font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-app-sec/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center text-xs shrink-0">
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
                      u.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 font-bold text-emerald-500">
                    ${u.demoBalance.toLocaleString()} USDT
                  </td>

                  <td className="py-3.5 text-app-sec text-[11px] font-mono">
                    {u.lastLogin}
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg bg-app-sec text-app hover:bg-app-sec/80 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleResetDemoBalance(u)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                        title="Reset Demo Funds to $10k"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleSuspend(u.id)}
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
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.id} className="p-4 rounded-2xl bg-app-sec/30 border border-app space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent font-bold flex items-center justify-center text-xs shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-app block">{u.name}</span>
                    <span className="text-[10px] text-app-sec">{u.email}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {u.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-app/60">
                <div>
                  <span className="text-app-sec block">UID:</span>
                  <strong className="text-app font-mono">#{u.id}</strong>
                </div>

                <div>
                  <span className="text-app-sec block">Demo Funds:</span>
                  <strong className="text-emerald-500">${u.demoBalance.toLocaleString()}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-app/60 text-xs">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="px-3 py-1.5 rounded-xl bg-app-sec text-app font-bold text-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Profile
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResetDemoBalance(u)}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold"
                    title="Reset Demo Funds"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleSuspend(u.id)}
                    className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold"
                  >
                    {u.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* User Profile Modal Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent font-extrabold flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-app">{selectedUser.name}</h3>
                  <span className="text-xs text-app-sec">UID #{selectedUser.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-app-sec/40 border border-app">
                <div>
                  <span className="text-app-sec block text-[10px]">Email Address</span>
                  <span className="font-bold text-app">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-app-sec block text-[10px]">KYC Status</span>
                  <span className="font-bold text-emerald-500">{selectedUser.kycLevel}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-app-sec/40 border border-app">
                <div>
                  <span className="text-app-sec block text-[10px]">Simulator Demo Funds</span>
                  <span className="font-bold text-emerald-500">${selectedUser.demoBalance.toLocaleString()} USDT</span>
                </div>
                <div>
                  <span className="text-app-sec block text-[10px]">Live Real Wallet Balance</span>
                  <span className="font-bold text-app">${selectedUser.realBalance.toLocaleString()} USDT</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-app-sec/40 border border-app space-y-1">
                <span className="text-app-sec block text-[10px]">Security & Session History</span>
                <div className="flex justify-between text-app font-mono pt-1">
                  <span>Last Active: <strong>{selectedUser.lastLogin}</strong></span>
                  <span>IP: <strong>{selectedUser.ip}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-app">
              <button
                onClick={() => {
                  handleResetDemoBalance(selectedUser);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs"
              >
                Reset Demo Funds to $10k
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 rounded-xl bg-app-sec text-app font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
