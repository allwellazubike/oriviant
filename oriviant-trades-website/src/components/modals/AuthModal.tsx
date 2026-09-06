import React, { useState } from 'react';
import { X, Smartphone, Download, ArrowRight, ShieldCheck, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { NavigationTab } from '../../types';
import { useUser } from '../../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onNavigate: (tab: NavigationTab) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onNavigate }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Trigger mock login/signup
    login(email, password);
    setIsSuccess(true);
  };

  const handleOpenApp = () => {
    // Attempt deep link schema
    window.location.href = 'oriviant://app';
    setTimeout(() => {
      onClose();
      onNavigate('download');
    }, 1200);
  };

  const handleGoToDownload = () => {
    onClose();
    onNavigate('download');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-app">
                {mode === 'login' ? 'Authentication Successful!' : 'Account Created Successfully!'}
              </h3>
              <p className="text-xs text-app-sec leading-relaxed max-w-xs mx-auto">
                Live trading accounts and order execution are managed inside the official ORIVIANT Mobile App.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleOpenApp}
                className="w-full py-3.5 rounded-2xl bg-accent text-white font-extrabold text-xs shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open ORIVIANT Mobile App</span>
              </button>

              <button
                onClick={handleGoToDownload}
                className="w-full py-3.5 rounded-2xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>App Not Installed? Download APK</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-extrabold text-[10px] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official ORIVIANT Onboarding
              </div>
              <h2 className="text-2xl font-black text-app">
                {mode === 'login' ? 'Welcome Back to ORIVIANT' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-app-sec">
                {mode === 'login' ? 'Log in to access your verified account credentials.' : 'Join 1.8M+ global traders on ORIVIANT.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-app-sec border border-app text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 rounded-xl transition-all ${mode === 'login' ? 'bg-accent text-white shadow-sm' : 'text-app-sec hover:text-app'}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-xl transition-all ${mode === 'signup' ? 'bg-accent text-white shadow-sm' : 'text-app-sec hover:text-app'}`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-app">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-app">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-app-sec border border-app rounded-xl pl-10 pr-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-app">Password</label>
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

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{mode === 'login' ? 'Log In & Continue' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-[11px] text-center text-app-sec">
              By continuing, you agree to ORIVIANT’s{' '}
              <button onClick={() => { onClose(); onNavigate('terms'); }} className="text-accent underline font-semibold">Terms</button>{' '}
              & <button onClick={() => { onClose(); onNavigate('privacy'); }} className="text-accent underline font-semibold">Privacy Policy</button>.
            </div>
          </>
        )}

      </div>
    </div>
  );
};
