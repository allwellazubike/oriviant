import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, ShieldCheck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { SignUpForm } from './SignUpForm';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login } = useUser();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot' | 'pin' | 'otp'>(authModalTab);

  const [email, setEmail] = useState('trader.alex@oriviant.io');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState(['4', '8', '1', '9', '2', '0']);
  const [pin, setPin] = useState(['1', '2', '3', '4']);
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    setTab(authModalTab);
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      login(email, rememberMe);
    } else if (tab === 'otp') {
      setTab('pin');
    } else if (tab === 'pin' || tab === 'forgot') {
      login(email, rememberMe);
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
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors z-20 cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-5 sm:p-8">
          
          {tab === 'signup' ? (
            <SignUpForm 
              onSwitchToLogin={() => setTab('login')} 
              onSuccessLogin={(userEmail) => {
                login(userEmail, true);
              }}
            />
          ) : (
            <>
              {/* Header Branding for Login / Forgot / OTP / PIN */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-full h-full bg-app-card rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-app tracking-tight">
                  {tab === 'login' && 'Welcome Back to Oriviant'}
                  {tab === 'forgot' && 'Reset Your Password'}
                  {tab === 'otp' && 'Verify 2FA Security Code'}
                  {tab === 'pin' && 'Create Quick Access PIN'}
                </h3>
                <p className="text-xs text-app-sec mt-1">
                  {tab === 'login' && 'Access institutional liquidity & 125x perp futures'}
                  {tab === 'forgot' && 'Enter your email to receive recovery instructions'}
                  {tab === 'otp' && 'Enter the 6-digit verification code sent to your device'}
                  {tab === 'pin' && 'Set a 4-digit security PIN for biometric quick sign-in'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email Input */}
                {(tab === 'login' || tab === 'forgot') && (
                  <div>
                    <label className="block text-xs font-semibold text-app-sec mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                {tab === 'login' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-app-sec">Password</label>
                      <button
                        type="button"
                        onClick={() => setTab('forgot')}
                        className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Remember Me checkbox for Login */}
                {tab === 'login' && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-accent focus:ring-accent cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-[11px] font-medium text-app-sec cursor-pointer">
                      Remember my session on this device
                    </label>
                  </div>
                )}

                {/* OTP Code Input */}
                {tab === 'otp' && (
                  <div className="flex justify-center gap-2 py-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const copy = [...otp];
                          copy[idx] = e.target.value;
                          setOtp(copy);
                        }}
                        className="w-10 h-12 text-center font-bold text-lg bg-app-sec border border-app rounded-xl text-app focus:border-accent focus:outline-none"
                      />
                    ))}
                  </div>
                )}

                {/* PIN Code Input */}
                {tab === 'pin' && (
                  <div className="flex justify-center gap-3 py-2">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const copy = [...pin];
                          copy[idx] = e.target.value;
                          setPin(copy);
                        }}
                        className="w-12 h-14 text-center font-bold text-xl bg-app-sec border border-app rounded-xl text-app focus:border-accent focus:outline-none"
                      />
                    ))}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <span>
                    {tab === 'login' && 'Sign In to Account'}
                    {tab === 'forgot' && 'Send Reset Link'}
                    {tab === 'otp' && 'Verify Security Code'}
                    {tab === 'pin' && 'Save Security PIN'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

              {/* Social Login Divider & Button for Login Tab */}
              {tab === 'login' && (
                <div className="space-y-3 pt-3">
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-app w-full" />
                    <span className="bg-app-card px-3 text-[10px] font-bold text-app-sec tracking-widest uppercase absolute">
                      OR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => login('google.user@oriviant.io', true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              {/* Toggle Footer */}
              <div className="mt-6 pt-4 border-t border-app text-center">
                <p className="text-xs text-app-sec">
                  Don't have an Oriviant account?{' '}
                  <button
                    onClick={() => setTab('signup')}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

