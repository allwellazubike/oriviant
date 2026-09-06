import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle, 
  Laptop, 
  Globe, 
  Clock, 
  LogOut, 
  X, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const AdminSecurityTab: React.FC = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [loginHistory] = useState([
    { id: '1', date: '2026-08-04 15:32 UTC', ip: '185.220.101.5', device: 'Chrome / macOS (Owner)', status: 'Success' },
    { id: '2', date: '2026-08-03 21:14 UTC', ip: '185.220.101.5', device: 'Chrome / macOS (Owner)', status: 'Success' },
    { id: '3', date: '2026-08-02 09:45 UTC', ip: '194.26.29.12', device: 'Firefox / Linux', status: 'Failed Attempt' },
  ]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setToastMsg('New passwords do not match!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setToastMsg('Administrator password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Change Password Form */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Update Administrator Master Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block font-bold text-app-sec mb-1">Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1">New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md"
          >
            Update Master Password
          </button>
        </form>
      </div>

      {/* Security Sessions & Logins */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>Administrator Access & Login Audit Log</span>
          </h3>

          <button
            onClick={() => {
              setToastMsg('Terminated all active admin sessions across all devices.');
              setTimeout(() => setToastMsg(null), 3500);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out From All Devices</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {loginHistory.map((h) => (
            <div key={h.id} className="p-3.5 rounded-2xl bg-app-sec/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-app block">{h.device}</span>
                <span className="text-[10px] text-app-sec font-mono">IP: {h.ip} • Timestamp: {h.date}</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold self-start sm:self-auto ${
                h.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
