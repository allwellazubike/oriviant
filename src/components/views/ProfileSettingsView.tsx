import React, { useRef, useState } from 'react';
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
  Mail,
  ShieldAlert,
  Trash2,
  Clock,
  Laptop,
  Check,
  AlertCircle,
  Camera,
  Pencil,
  X,
  Loader2
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization, LANGUAGE_OPTIONS, CURRENCY_OPTIONS, LanguageCode, CurrencyCode } from '../../contexts/LocalizationContext';
import { NavigationTab } from '../../types';
import { securityApi } from '../../api/security';
import { KycLevel1Card } from '../kyc/KycLevel1Card';
import { KycLevel2Card } from '../kyc/KycLevel2Card';

interface ProfileSettingsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onNavigate }) => {
  const {
    user,
    logout,
    securityState,
    updateAntiPhishingCode,
    removeTrustedDevice,
    updateProfile,
    uploadAvatar
  } = useUser();
  const { mode, toggleTheme } = useTheme();
  const { t, language, setLanguage, currency, setCurrency } = useLocalization();

  const [draftLanguage, setDraftLanguage] = useState<LanguageCode>(language);
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [antiPhishingInput, setAntiPhishingInput] = useState(securityState.antiPhishingCode || 'ORIVIANT-SECURE-894');
  const [isEditingPhishing, setIsEditingPhishing] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user.nickname);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const flashMessage = (text: string, isError = false) => {
    if (isError) setErrMsg(text); else setMsg(text);
    setTimeout(() => { setMsg(null); setErrMsg(null); }, 4000);
  };

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
      flashMessage('Please choose an image file (PNG, JPG or WEBP).', true);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      flashMessage('Image is too large. Please choose a file under 5MB.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setIsUploadingAvatar(true);
      const result = await uploadAvatar(dataUri);
      setIsUploadingAvatar(false);
      if (result.success) {
        flashMessage('Profile picture updated successfully.');
      } else {
        flashMessage(result.error || 'Could not upload your profile picture.', true);
      }
    };
    reader.onerror = () => flashMessage('Could not read that file. Please try another image.', true);
    reader.readAsDataURL(file);
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 40) {
      flashMessage('Display name must be between 2 and 40 characters.', true);
      return;
    }

    setIsSavingProfile(true);
    const result = await updateProfile(trimmed);
    setIsSavingProfile(false);

    if (result.success) {
      setIsEditingProfile(false);
      flashMessage('Profile details updated successfully.');
    } else {
      flashMessage(result.error || 'Could not update your profile.', true);
    }
  };

  const handleSavePreferences = () => {
    setLanguage(draftLanguage);
    setCurrency(draftCurrency);
    flashMessage(t('profile.preferencesSaved'));
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  const handleSaveAntiPhishing = async (e: React.FormEvent) => {
    e.preventDefault();
    updateAntiPhishingCode(antiPhishingInput);
    setIsEditingPhishing(false);

    try {
      await securityApi.updateAntiPhishingCode(antiPhishingInput);
      setMsg('Anti-Phishing Code updated successfully on server! This code will appear in all official emails from Oriviant.');
    } catch (err) {
      setMsg('Anti-Phishing Code updated locally (offline mode active).');
    }
    setTimeout(() => setMsg(null), 4000);
  };

  const handleRevokeSessionBackend = async (deviceId: string) => {
    removeTrustedDevice(deviceId);
    try {
      await securityApi.revokeSession(deviceId);
      setMsg('Session successfully revoked on server.');
    } catch (err) {
      setMsg('Session revoked locally.');
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">

      {/* Profile Banner Card */}
      <div className="p-6 lg:p-8 rounded-3xl bg-app-card border border-app shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              alt={user.nickname}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-accent/30 shadow-md"
            />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarFileSelected}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center border-2 border-app-card shadow-md cursor-pointer disabled:opacity-60"
              title={t('profile.changePicture')}
            >
              {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            </button>
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            {isEditingProfile ? (
              <form onSubmit={handleSaveNickname} className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="min-w-0 flex-1 px-3 py-1.5 rounded-xl bg-app-sub border border-app text-sm font-bold text-app focus:outline-none focus:border-accent"
                  placeholder="Display name"
                  maxLength={40}
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('profile.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditingProfile(false); setNicknameInput(user.nickname); }}
                  className="w-8 h-8 rounded-xl bg-app-sub border border-app text-app-sec flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-app truncate">{user.nickname}</h1>
                <button
                  onClick={() => { setNicknameInput(user.nickname); setIsEditingProfile(true); }}
                  className="w-6 h-6 rounded-lg bg-app-sub hover:bg-app-sub/70 text-app-sec flex items-center justify-center shrink-0 cursor-pointer"
                  title={t('profile.editName')}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border inline-flex items-center gap-1 shrink-0 ${
                  user.kycLevel?.includes('Verified') 
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' 
                    : user.kycLevel?.includes('Pending') || user.kycLevel?.includes('Review')
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/20'
                    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.kycLevel || 'Unverified'}</span>
                </span>
              </div>
            )}
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
          <span>{t('profile.signOut')}</span>
        </button>
      </div>

      {/* KYC Level 1 Verification Section */}
      <KycLevel1Card />

      {/* KYC Level 2 Verification Section */}
      <KycLevel2Card />

      {/* Security Health Score Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-purple-500/10 border border-emerald-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0">
            95%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-app">{t('profile.securityScoreTitle')}</h3>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-white">{t('profile.highlySecured')}</span>
            </div>
            <p className="text-xs text-app-sec mt-1">{t('profile.securityScoreDesc')}</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('demo-workspace')}
          className="px-4 py-2.5 rounded-xl bg-app-card hover:bg-app-sub border border-app text-app font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>{t('profile.practiceDemo')}</span>
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

      {errMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errMsg}</span>
          </div>
          <button onClick={() => setErrMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Security Center & 2FA Suite */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
        <div>
          <h2 className="text-base font-black text-app flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <span>{t('profile.suiteTitle')}</span>
          </h2>
          <p className="text-xs text-app-sec">{t('profile.suiteDesc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Email Verification */}
          <div className="p-4 rounded-2xl bg-app-sub/40 border border-app space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-accent" />
                  <span>{t('profile.emailVerification')}</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-500">
                  {t('profile.verifiedBadge')}
                </span>
              </div>
              <p className="text-[11px] text-app-sec font-mono truncate">{securityState.email}</p>
            </div>
            <div className="text-[10px] text-app-sec pt-2 border-t border-app">{t('profile.emailNote')}</div>
          </div>

        </div>

        {/* Anti-Phishing Code Settings */}
        <div className="p-5 rounded-2xl bg-app-sub/40 border border-app space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-app flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>{t('profile.antiPhishingTitle')}</span>
              </span>
              <p className="text-[11px] text-app-sec">{t('profile.antiPhishingDesc')}</p>
            </div>

            {!isEditingPhishing && (
              <button
                onClick={() => setIsEditingPhishing(true)}
                className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                {t('profile.changeCode')}
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
                {t('profile.saveCode')}
              </button>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-app-card border border-app text-xs font-mono font-bold text-accent flex items-center justify-between">
              <span>Code: {securityState.antiPhishingCode || 'ORIVIANT-SECURE-894'}</span>
              <span className="text-[10px] text-emerald-500 font-sans">{t('profile.protected')}</span>
            </div>
          )}
        </div>

      </div>

      {/* Trusted Devices Management */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div>
          <h2 className="text-base font-black text-app flex items-center gap-2">
            <Laptop className="w-5 h-5 text-accent" />
            <span>{t('profile.trustedDevicesTitle')}</span>
          </h2>
          <p className="text-xs text-app-sec">{t('profile.trustedDevicesDesc')}</p>
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
                      {t('profile.currentDevice')}
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
                  onClick={() => handleRevokeSessionBackend(dev.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs border border-rose-500/20 transition-all flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('profile.revokeSession')}</span>
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
            <span>{t('profile.loginActivityTitle')}</span>
          </h2>
          <p className="text-xs text-app-sec">{t('profile.loginActivityDesc')}</p>
        </div>

        {securityState.loginHistory.length === 0 ? (
          <div className="text-center py-10 text-app-sec text-xs font-bold">{t('profile.noLoginHistory')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                  <th className="py-2.5 px-4">{t('profile.dateTime')}</th>
                  <th className="py-2.5 px-4">{t('profile.deviceBrowser')}</th>
                  <th className="py-2.5 px-4">{t('profile.location')}</th>
                  <th className="py-2.5 px-4">{t('profile.ipAddress')}</th>
                  <th className="py-2.5 px-4 text-right">{t('profile.status')}</th>
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
        )}
      </div>

      {/* Preferences Settings */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <h3 className="text-sm font-bold text-app flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent shrink-0" />
          <span>{t('profile.preferencesTitle')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">{t('profile.themeMode')}</label>
            <button
              onClick={toggleTheme}
              className="w-full py-2.5 px-3 rounded-xl bg-app-sub border border-app text-xs font-bold text-app flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>{mode === 'dark' ? t('profile.darkTheme') : t('profile.lightTheme')}</span>
              {mode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">{t('profile.language')}</label>
            <select
              value={draftLanguage}
              onChange={(e) => setDraftLanguage(e.target.value as LanguageCode)}
              className="w-full bg-app-sub border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">{t('profile.displayCurrency')}</label>
            <select
              value={draftCurrency}
              onChange={(e) => setDraftCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-app-sub border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 cursor-pointer"
          >
            {t('profile.savePreferences')}
          </button>
          {preferencesSaved && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              {t('profile.preferencesSaved')}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};