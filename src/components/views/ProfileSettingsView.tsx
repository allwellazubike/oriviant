import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  CheckCircle2,
  Key,
  Zap,
  ChevronRight,
  Smartphone,
  Mail,
  KeyRound,
  ShieldAlert,
  Trash2,
  Clock,
  Laptop,
  Check,
  AlertCircle
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NavigationTab } from '../../types';

interface ProfileSettingsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onNavigate }) => {
  const { 
    user, 
    logout, 
    securityState, 
    updateAntiPhishingCode, 
    removeTrustedDevice 
  } = useUser();
  const { mode, toggleTheme } = useTheme();

  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD ($)');
  const [msg, setMsg] = useState<string | null>(null);

  const [antiPhishingInput, setAntiPhishingInput] = useState(securityState.antiPhishingCode || 'ORIVIANT-SECURE-894');
  const [isEditingPhishing, setIsEditingPhishing] = useState(false);

  const handleSavePreferences = () => {
    setMsg('Preferences updated successfully.');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveAntiPhishing = (e: React.FormEvent) => {
    e.preventDefault();
    updateAntiPhishingCode(antiPhishingInput);
    setIsEditingPhishing(false);
    setMsg('Anti-Phishing Code updated successfully! This code will appear in all official emails from Oriviant.');
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Profile Banner Card */}
      <div className="p-6 lg:p-8 rounded-3xl bg-app-card border border-app shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={user.avatar}
            alt={user.nickname}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-accent/30 shadow-md shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-app truncate">{user.nickname}</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Level 2 Enterprise Verified</span>
              </span>
            </div>
            <p className="text-xs text-app-sec truncate">{user.email}</p>
            <div className="text-[11px] text-app-sec flex items-center gap-3 font-mono pt-0.5">
              <span>UID: <strong className="text-app">{user.id}</strong></span>
              <span>•</span>
              <span className="text-accent font-bold">VIP {user.vipLevel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Security Health Score Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-purple-500/10 border border-emerald-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0">
            95%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-app">Security Protection Score</h3>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-white">HIGHLY SECURED</span>
            </div>
            <p className="text-xs text-app-sec mt-1">Your account uses 2FA, Email Verification, Whitelisted Addresses, and Anti-Phishing protection.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('demo-workspace')}
          className="px-4 py-2.5 rounded-xl bg-app-card hover:bg-app-sub border border-app text-app font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>Practice Demo Workspace</span>
        </button>
      </div>

      {/* Global Message Alert */}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg(null)}><Check className="w-4 h-4" /></button>
        </div>
      )}

      {/* Security Center & 2FA Suite */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
        <div>
          <h2 className="text-base font-black text-app flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <span>Account Security & Verification Suite</span>
          </h2>
          <p className="text-xs text-app-sec">Multi-tier authentication and anti-phishing protection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Email Verification */}
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-accent" />
                  <span>Email Verification</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-500">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-app-sec font-mono truncate">{securityState.email}</p>
            </div>
            <div className="text-[10px] text-app-sec pt-2 border-t border-app">Required for all withdrawals and password changes.</div>
          </div>

          {/* Google 2FA Authenticator */}
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Google Authenticator 2FA</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-500">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-app-sec">TOTP Time-based Security Token Enabled</p>
            </div>
            <div className="text-[10px] text-app-sec pt-2 border-t border-app">Protects funds from unauthorized withdrawals.</div>
          </div>

          {/* Passkey / WebAuthn */}
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Biometric Passkey</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-purple-500/20 text-purple-400">
                  HARDWARE READY
                </span>
              </div>
              <p className="text-[11px] text-app-sec">FaceID / TouchID / FIDO2 Key</p>
            </div>
            <div className="text-[10px] text-app-sec pt-2 border-t border-app">Next-gen passwordless security option.</div>
          </div>

        </div>

        {/* Anti-Phishing Code Settings */}
        <div className="p-5 rounded-2xl bg-app-sub/40 border border-app space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Custom Anti-Phishing Code</span>
              </span>
              <p className="text-[11px] text-app-sec">This code will be embedded into every official notification email sent by Oriviant to prevent email spoofing and phishing.</p>
            </div>

            {!isEditingPhishing && (
              <button
                onClick={() => setIsEditingPhishing(true)}
                className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Change Code
              </button>
            )}
          </div>

          {isEditingPhishing ? (
            <form onSubmit={handleSaveAntiPhishing} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={antiPhishingInput}
                onChange={(e) => setAntiPhishingInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-app-card border border-app text-xs font-mono font-bold text-app focus:outline-none focus:border-accent"
                placeholder="Enter custom code e.g. MY-SECURE-VAULT"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Save Code
              </button>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-app-card border border-app text-xs font-mono font-bold text-accent flex items-center justify-between">
              <span>Code: {securityState.antiPhishingCode || 'ORIVIANT-SECURE-894'}</span>
              <span className="text-[10px] text-emerald-500 font-sans">PROTECTED</span>
            </div>
          )}
        </div>

      </div>

      {/* Trusted Devices Management */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div>
          <h2 className="text-base font-black text-app flex items-center gap-2">
            <Laptop className="w-5 h-5 text-accent" />
            <span>Trusted Device Management</span>
          </h2>
          <p className="text-xs text-app-sec">Active devices authorized to access your Oriviant wallet</p>
        </div>

        <div className="space-y-3">
          {securityState.trustedDevices.map((dev) => (
            <div
              key={dev.id}
              className="p-4 rounded-2xl bg-app-sub/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-app">{dev.deviceName}</span>
                  {dev.isCurrentDevice && (
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-500">
                      CURRENT DEVICE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-app-sec font-mono flex flex-wrap items-center gap-2">
                  <span>{dev.browser} ({dev.os})</span>
                  <span>•</span>
                  <span>{dev.location}</span>
                  <span>•</span>
                  <span>IP: {dev.ip}</span>
                </div>
              </div>

              {!dev.isCurrentDevice && (
                <button
                  onClick={() => removeTrustedDevice(dev.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs border border-rose-500/20 transition-all flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Session</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Login Audit History */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div>
          <h2 className="text-base font-black text-app flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <span>Recent Login Activity Logs</span>
          </h2>
          <p className="text-xs text-app-sec">Audit record of recent IP connections and device authorizations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Device & Browser</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/50 text-xs font-mono">
              {securityState.loginHistory.map((log) => (
                <tr key={log.id} className="hover:bg-app-sub/30 transition-colors">
                  <td className="py-3 px-4 text-app font-bold">{log.loginTime}</td>
                  <td className="py-3 px-4 text-app-sec">{log.device} - {log.browser} ({log.os})</td>
                  <td className="py-3 px-4 text-app-sec">{log.location}</td>
                  <td className="py-3 px-4 text-accent">{log.ip}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      log.status === 'Success' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preferences Settings */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <h3 className="text-sm font-bold text-app flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent shrink-0" />
          <span>Trading Preferences & Localization</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Theme Mode</label>
            <button
              onClick={toggleTheme}
              className="w-full py-2.5 px-3 rounded-xl bg-app-sub border border-app text-xs font-bold text-app flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>{mode === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
              {mode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-app-sub border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>German</option>
              <option>Japanese</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Display Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-app-sub border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 cursor-pointer"
        >
          Save Preferences
        </button>
      </div>

    </div>
  );
};
