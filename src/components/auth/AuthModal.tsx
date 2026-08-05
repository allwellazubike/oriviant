import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, ShieldCheck, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login } = useUser();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot' | 'pin' | 'otp'>(authModalTab);

  const [email, setEmail] = useState('trader.alex@oriviant.io');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState(['4', '8', '1', '9', '2', '0']);
  const [pin, setPin] = useState(['1', '2', '3', '4']);
  const [agreedTerms, setAgreedTerms] = useState(true);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      login(email);
    } else if (tab === 'signup') {
      setTab('otp');
    } else if (tab === 'otp') {
      setTab('pin');
    } else if (tab === 'pin' || tab === 'forgot') {
      login(email);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-app-card border border-app rounded-3xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 mx-auto mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-app-card rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-black text-app tracking-tight">
              {tab === 'login' && 'Welcome Back to Oriviant'}
              {tab === 'signup' && 'Create Your Oriviant Account'}
              {tab === 'forgot' && 'Reset Your Password'}
              {tab === 'otp' && 'Verify 2FA Security Code'}
              {tab === 'pin' && 'Create Quick Access PIN'}
            </h3>
            <p className="text-xs text-app-sec mt-1">
              {tab === 'login' && 'Access institutional liquidity & 125x perp futures'}
              {tab === 'signup' && 'Claim your $10,000 USDT Demo Balance immediately'}
              {tab === 'forgot' && 'Enter your email to receive recovery instructions'}
              {tab === 'otp' && 'Enter the 6-digit verification code sent to your device'}
              {tab === 'pin' && 'Set a 4-digit security PIN for biometric quick sign-in'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            {(tab === 'login' || tab === 'signup' || tab === 'forgot') && (
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
            {(tab === 'login' || tab === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-app-sec">Password</label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] font-semibold text-accent hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
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

            {/* Terms checkbox for Signup */}
            {tab === 'signup' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <label htmlFor="terms" className="text-[11px] text-app-sec">
                  I agree to Oriviant's <span className="text-accent underline cursor-pointer">Terms of Service</span> and <span className="text-accent underline cursor-pointer">Privacy Policy</span>.
                </label>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {tab === 'login' && 'Sign In to Account'}
                {tab === 'signup' && 'Create Free Account'}
                {tab === 'forgot' && 'Send Reset Link'}
                {tab === 'otp' && 'Verify Security Code'}
                {tab === 'pin' && 'Save Security PIN'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Toggle Footer */}
          <div className="mt-6 pt-4 border-t border-app text-center">
            {tab === 'login' ? (
              <p className="text-xs text-app-sec">
                Don't have an Oriviant account?{' '}
                <button
                  onClick={() => setTab('signup')}
                  className="font-bold text-accent hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-app-sec">
                Already registered?{' '}
                <button
                  onClick={() => setTab('login')}
                  className="font-bold text-accent hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
