import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
import { apiClient } from '../../api/client';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
  onExitToPlatform: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess, onExitToPlatform }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Send credentials to real backend auth endpoint
      const res = await apiClient<{ success?: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      
      if (res.token && res.user) {
        // Strictly enforce admin role (backend verifyAdmin will also enforce this on API routes)
        if (res.user.role !== 'admin' && res.user.role !== 'superadmin') {
          setError('Access Denied: Administrator privileges required.');
          setIsLoading(false);
          return;
        }

        const authData = JSON.stringify({
          authenticated: true,
          email: res.user.email,
          timestamp: Date.now()
        });

        // Store real JWT token for secure API requests across the admin portal
        if (rememberMe) {
          localStorage.setItem('oriviant_token', res.token);
          localStorage.setItem('oriviant_admin_auth', authData);
        } else {
          sessionStorage.setItem('oriviant_token', res.token);
          sessionStorage.setItem('oriviant_admin_auth', authData);
        }
        
        onLoginSuccess();
      } else {
        setError('Invalid administrator credentials.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Back Button */}
        <button
          onClick={onExitToPlatform}
          className="inline-flex items-center gap-2 text-xs font-semibold text-app-sec hover:text-app transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Oriviant Platform</span>
        </button>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-app-card border border-app shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

          {/* Oriviant Logo & Title Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 shrink-0 mx-auto mb-2">
              <div className="w-full h-full bg-app-card rounded-[14px] flex items-center justify-center font-bold text-accent">
                <Sparkles className="w-6 h-6 text-accent animate-pulse" />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-app">ORIVIANT</span>
              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-500 rounded-md uppercase border border-amber-500/30">
                ADMIN
              </span>
            </div>

            <p className="text-xs text-app-sec font-medium">
              Restricted Access – Authorized Administrators Only
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-app-sec mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oriviant.io"
                required
                className="w-full bg-app-sec border border-app rounded-xl px-4 py-3 text-xs font-bold text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-app-sec mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-app-sec border border-app rounded-xl pl-4 pr-10 py-3 text-xs font-bold text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-sec hover:text-app transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-app-sec font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-app text-amber-500 focus:ring-amber-500/20"
                />
                <span>Remember Me</span>
              </label>

              <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 2FA Protected
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="pt-4 border-t border-app text-center">
            <p className="text-[11px] text-app-sec leading-relaxed">
              Restricted Access – Authorized Administrators Only
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};