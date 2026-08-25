import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, ShieldCheck, Sparkles, Check, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { SignUpForm } from './SignUpForm';
import { apiClient } from '../../api/client';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login } = useUser();
  const { t } = useLocalization();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot' | 'verify-signup' | 'verify-forgot' | 'reset-password'>(authModalTab as any);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [resetToken, setResetToken] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab as any);
      setApiError('');
      setSuccessMessage('');
      setPassword('');
      setNewPassword('');
      setOtp(['', '', '', '', '', '']);
      setShowPassword(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleOtpChange = (val: string, idx: number) => {
    if (isNaN(Number(val))) return;
    const copy = [...otp];
    copy[idx] = val;
    setOtp(copy);

    // Auto-focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email.trim(), password, rememberMe);
      } else if (tab === 'forgot') {
        const res = await apiClient<{ success: boolean; message: string }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() }),
        });
        if (res.success) {
          setTab('verify-forgot');
          setSuccessMessage('A 6-digit code has been sent to your email.');
        }
      } else if (tab === 'verify-forgot') {
        const codeStr = otp.join('');
        const res = await apiClient<{ success: boolean; resetToken: string }>('/auth/verify-reset-code', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), code: codeStr }),
        });
        if (res.success && res.resetToken) {
          setResetToken(res.resetToken);
          setTab('reset-password');
        }
      } else if (tab === 'verify-signup') {
        const codeStr = otp.join('');
        const res = await apiClient<{ success: boolean; token: string }>('/auth/verify-registration', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), code: codeStr }),
        });
        if (res.success && res.token) {
          localStorage.setItem('oriviant_token', res.token);
          window.location.reload(); // Refresh context session
        }
      } else if (tab === 'reset-password') {
        const res = await apiClient<{ success: boolean; token: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ resetToken, password: newPassword }),
        });
        if (res.success && res.token) {
          localStorage.setItem('oriviant_token', res.token);
          window.location.reload();
        }
      }
    } catch (err: any) {
      setApiError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full ${
          tab === 'signup' ? 'max-w-xl' : 'max-w-md'
        } max-h-[92vh] overflow-y-auto custom-scrollbar bg-app-card border border-app rounded-3xl shadow-2xl relative transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors z-20 cursor-pointer"
          aria-label={t('auth.closeModal')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8">
          
          {tab === 'signup' ? (
            <SignUpForm 
              onSwitchToLogin={() => setTab('login')} 
              onSuccessRegistration={(registeredEmail: string) => {
                setEmail(registeredEmail);
                setTab('verify-signup');
              }}
            />
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-full h-full bg-app-card rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-app tracking-tight">
                  {tab === 'login' && t('auth.welcomeBack')}
                  {tab === 'forgot' && 'Reset Password'}
                  {tab === 'verify-signup' && 'Verify Your Email'}
                  {tab === 'verify-forgot' && 'Enter Verification Code'}
                  {tab === 'reset-password' && 'Set New Password'}
                </h3>
                <p className="text-xs text-app-sec mt-1">
                  {tab === 'login' && t('auth.loginSubtitle')}
                  {tab === 'forgot' && 'Enter your account email to receive a password reset code.'}
                  {tab === 'verify-signup' && `We sent a 6-digit verification code to ${email}`}
                  {tab === 'verify-forgot' && `Enter the code sent to ${email}`}
                  {tab === 'reset-password' && 'Please choose a secure new password (min 8 characters).'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {(tab === 'login' || tab === 'forgot') && (
                  <div>
                    <label className="block text-xs font-semibold text-app-sec mb-1.5">{t('auth.emailAddress')}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                )}

                {tab === 'login' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-app-sec">{t('auth.password')}</label>
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                      >
                        {t('auth.forgot')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-10 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-sec hover:text-app transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'reset-password' && (
                  <div>
                    <label className="block text-xs font-semibold text-app-sec mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-10 py-2.5 text-xs text-app focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                )}

                {(tab === 'verify-signup' || tab === 'verify-forgot') && (
                  <div className="flex justify-center gap-2 py-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        className="w-10 h-12 text-center font-bold text-lg bg-app-sec border border-app rounded-xl text-app focus:border-accent focus:outline-none"
                      />
                    ))}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                    {successMessage}
                  </div>
                )}

                {apiError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {tab === 'login' && t('auth.signInToAccount')}
                        {tab === 'forgot' && 'Send Code'}
                        {tab === 'verify-signup' && 'Verify & Enter'}
                        {tab === 'verify-forgot' && 'Verify Code'}
                        {tab === 'reset-password' && 'Update Password'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {tab === 'login' && (
                <div className="mt-6 pt-4 border-t border-app text-center">
                  <p className="text-xs text-app-sec">
                    {t('auth.noAccount')}{' '}
                    <button
                      onClick={() => setTab('signup')}
                      className="font-bold text-accent hover:underline cursor-pointer"
                    >
                      {t('auth.signUp')}
                    </button>
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};