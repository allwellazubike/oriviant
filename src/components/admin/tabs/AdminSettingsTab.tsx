import React, { useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Save, 
  Globe, 
  Mail, 
  CheckCircle2, 
  X, 
  Lock,
  Palette,
  Zap
} from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const [platformName, setPlatformName] = useState('Oriviant Global Exchange');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [smtpServer, setSmtpServer] = useState('smtp.mailgun.org');
  const [senderEmail, setSenderEmail] = useState('noreply@oriviant.io');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('Platform configuration updated and saved successfully.');
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

      {/* Emergency System Maintenance Toggle */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-500">Platform Emergency Maintenance Mode</h3>
              <p className="text-xs text-app-sec">When active, restricts public trading engine access and displays maintenance banner.</p>
            </div>
          </div>

          <button
            onClick={() => {
              const next = !maintenanceMode;
              setMaintenanceMode(next);
              setToastMsg(next ? 'Emergency Maintenance Mode ENABLED!' : 'Maintenance Mode DISABLED. System operational.');
            }}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all ${
              maintenanceMode
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {maintenanceMode ? 'System Locked (Maintenance Active)' : 'Activate Maintenance Mode'}
          </button>
        </div>
      </div>

      {/* Platform Branding & Identity Settings */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <span>Platform Identity & Access Controls</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-app-sec mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
                className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-app-sec mb-1">New User Registrations</label>
              <button
                type="button"
                onClick={() => setAllowRegistrations(!allowRegistrations)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  allowRegistrations
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}
              >
                <span>{allowRegistrations ? 'Registrations OPEN' : 'Registrations PAUSED'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Practice Demo Mode Module Configuration */}
        <div className="p-6 rounded-3xl bg-app-card border border-emerald-500/30 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Practice Demo Mode Module Settings & Management</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-app-sec mb-1">Default Practice Allocation</label>
              <input
                type="text"
                value="10,000 USDT"
                disabled
                className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-app-sec mb-1">Practice Demo Mode Module Status</label>
              <span className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-between">
                <span>ACTIVE (Independent)</span>
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div>
              <label className="block font-bold text-app-sec mb-1">Global Balance Reset</label>
              <button
                type="button"
                onClick={() => {
                  setToastMsg('Reset practice balances for active demo sessions back to 10,000 USDT.');
                  setTimeout(() => setToastMsg(null), 3500);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Reset Default Balances
              </button>
            </div>
          </div>
        </div>

        {/* Email & SMTP Gateway Settings */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>Email Gateway Configuration (Transactional & Verification)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-app-sec mb-1">SMTP Host Server</label>
              <input
                type="text"
                value={smtpServer}
                onChange={(e) => setSmtpServer(e.target.value)}
                className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-app-sec mb-1">Default Sender Email</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Executive Configuration</span>
        </button>
      </form>

    </div>
  );
};
