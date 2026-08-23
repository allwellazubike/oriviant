import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Save,
  Globe,
  Mail,
  CheckCircle2,
  X,
  Percent,
  Lock,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
}

interface TradingFeeSettings {
  makerFee: number;
  takerFee: number;
  futuresFee: number;
}

interface SecuritySettings {
  maxDailyWithdrawalUSDT: number;
  require2FAForWithdrawal: boolean;
}

export const AdminSettingsTab: React.FC = () => {
  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: 'Oriviant', supportEmail: '', maintenanceMode: false, allowRegistrations: true
  });
  const [fees, setFees] = useState<TradingFeeSettings>({ makerFee: 0.001, takerFee: 0.001, futuresFee: 0.0006 });
  const [security, setSecurity] = useState<SecuritySettings>({ maxDailyWithdrawalUSDT: 100000, require2FAForWithdrawal: true });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const flash = (text: string, isError = false) => {
    if (isError) setErrMsg(text); else setToastMsg(text);
    setTimeout(() => { setToastMsg(null); setErrMsg(null); }, 3500);
  };

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.settings) {
        if (res.settings.general) setGeneral((prev) => ({ ...prev, ...res.settings.general }));
        if (res.settings.trading_fees) setFees((prev) => ({ ...prev, ...res.settings.trading_fees }));
        if (res.settings.security) setSecurity((prev) => ({ ...prev, ...res.settings.security }));
      }
    } catch (error) {
      console.error('Failed to load platform settings:', error);
      flash('Failed to load platform settings.', true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveKey = async (key: string, value: Record<string, any>, label: string) => {
    setIsSaving(true);
    try {
      await adminApi.updateSetting(key, value);
      flash(`${label} saved successfully.`);
    } catch (error) {
      flash(`Failed to save ${label.toLowerCase()}.`, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    saveKey('general', general, 'Platform identity settings');
  };

  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    saveKey('trading_fees', fees, 'Trading fee settings');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    saveKey('security', security, 'Security settings');
  };

  const toggleMaintenanceMode = () => {
    const next = { ...general, maintenanceMode: !general.maintenanceMode };
    setGeneral(next);
    saveKey('general', next, 'Maintenance mode');
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-app-sec text-xs font-bold flex flex-col items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-accent" />
        Loading platform configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{errMsg}</span>
          <button onClick={() => setErrMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Emergency System Maintenance Toggle */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
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
            onClick={toggleMaintenanceMode}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all disabled:opacity-60 ${
              general.maintenanceMode ? 'bg-red-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {general.maintenanceMode ? 'System Locked (Maintenance Active)' : 'Activate Maintenance Mode'}
          </button>
        </div>
      </div>

      {/* Platform Identity & Access Controls */}
      <form onSubmit={handleSaveGeneral} className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span>Platform Identity & Access Controls</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-app-sec mb-1">Platform Brand Name</label>
            <input
              type="text"
              value={general.platformName}
              onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
              required
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1">Support Email</label>
            <input
              type="email"
              value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1">New User Registrations</label>
            <button
              type="button"
              onClick={() => setGeneral({ ...general, allowRegistrations: !general.allowRegistrations })}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
                general.allowRegistrations
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}
            >
              <span>{general.allowRegistrations ? 'Registrations OPEN' : 'Registrations PAUSED'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />
            <span>Save Identity Settings</span>
          </button>
        </div>
      </form>

      {/* Trading Fee Settings */}
      <form onSubmit={handleSaveFees} className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-500" />
          <span>Trading Fee Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-app-sec mb-1">Spot Maker Fee</label>
            <input
              type="number" step="0.0001" min="0" max="0.05"
              value={fees.makerFee}
              onChange={(e) => setFees({ ...fees, makerFee: Number(e.target.value) })}
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
            <p className="text-[10px] text-app-sec mt-1">{(fees.makerFee * 100).toFixed(3)}%</p>
          </div>
          <div>
            <label className="block font-bold text-app-sec mb-1">Spot Taker Fee</label>
            <input
              type="number" step="0.0001" min="0" max="0.05"
              value={fees.takerFee}
              onChange={(e) => setFees({ ...fees, takerFee: Number(e.target.value) })}
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
            <p className="text-[10px] text-app-sec mt-1">{(fees.takerFee * 100).toFixed(3)}%</p>
          </div>
          <div>
            <label className="block font-bold text-app-sec mb-1">Futures Fee</label>
            <input
              type="number" step="0.0001" min="0" max="0.05"
              value={fees.futuresFee}
              onChange={(e) => setFees({ ...fees, futuresFee: Number(e.target.value) })}
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
            <p className="text-[10px] text-app-sec mt-1">{(fees.futuresFee * 100).toFixed(3)}%</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />
            <span>Save Fee Settings</span>
          </button>
        </div>
      </form>

      {/* Security Settings */}
      <form onSubmit={handleSaveSecurity} className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Lock className="w-4 h-4 text-red-500" />
          <span>Withdrawal & Security Policy</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-app-sec mb-1">Max Daily Withdrawal (USDT)</label>
            <input
              type="number" min="0"
              value={security.maxDailyWithdrawalUSDT}
              onChange={(e) => setSecurity({ ...security, maxDailyWithdrawalUSDT: Number(e.target.value) })}
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 font-bold text-app focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1">Require 2FA for Withdrawals</label>
            <button
              type="button"
              onClick={() => setSecurity({ ...security, require2FAForWithdrawal: !security.require2FAForWithdrawal })}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
                security.require2FAForWithdrawal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}
            >
              <span>{security.require2FAForWithdrawal ? '2FA REQUIRED' : '2FA NOT ENFORCED'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" />
            <span>Save Security Policy</span>
          </button>
        </div>
      </form>

      {/* Email Delivery — informational, not DB-backed (the app sends via a transactional API, not SMTP) */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <span>Email Delivery</span>
        </h3>
        <p className="text-xs text-app-sec">
          Transactional email (password resets, deposit/withdrawal confirmations) is sent through the Brevo API, configured via
          server environment variables rather than this panel — there's no SMTP relay to configure.
        </p>
      </div>

    </div>
  );
};
