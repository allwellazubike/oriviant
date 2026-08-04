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
  Key
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NavigationTab } from '../../types';

interface ProfileSettingsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onNavigate }) => {
  const { user, logout } = useUser();
  const { mode, toggleTheme } = useTheme();

  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD ($)');
  const [msg, setMsg] = useState<string | null>(null);

  const handleSavePreferences = () => {
    setMsg('Preferences updated successfully.');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Profile Banner Card */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-app-card border border-app shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <img
            src={user.avatar}
            alt={user.nickname}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 sm:ring-4 ring-accent/30 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black text-app break-words">{user.nickname}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>Level 2 Verified</span>
              </span>
            </div>
            <p className="text-xs text-app-sec truncate max-w-full">{user.email}</p>
            <div className="text-[11px] text-app-sec flex flex-wrap items-center gap-2 sm:gap-3 font-mono pt-0.5">
              <span>UID: <strong className="text-app">{user.id}</strong></span>
              <span>•</span>
              <span className="text-accent font-bold">VIP {user.vipLevel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Security & Verification Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4 min-w-0">
        <h3 className="text-sm font-bold text-app flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent shrink-0" />
          <span>Security & Identity Verification</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 sm:p-4 rounded-xl bg-app-sec/50 border border-app flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-app block truncate">Two-Factor Authentication (2FA)</span>
              <span className="text-[10px] text-app-sec block truncate">Google Authenticator Enabled</span>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              ACTIVE
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-app-sec/50 border border-app flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-app block truncate">KYC Verification Level</span>
              <span className="text-[10px] text-app-sec block truncate">Level 2 Enterprise Verified</span>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Settings */}
      <div className="p-4 sm:p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4 min-w-0">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
            {msg}
          </div>
        )}

        <h3 className="text-sm font-bold text-app flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent shrink-0" />
          <span>Trading Preferences & Localization</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Theme Mode</label>
            <button
              onClick={toggleTheme}
              className="w-full py-2.5 px-3 rounded-xl bg-app-sec border border-app text-xs font-bold text-app flex items-center justify-between gap-2"
            >
              <span className="truncate">{mode === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
              {mode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400 shrink-0" /> : <Sun className="w-4 h-4 text-amber-500 shrink-0" />}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
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
              className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20"
        >
          Save Preferences
        </button>
      </div>

    </div>
  );
};
