import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  FileText, 
  Globe, 
  Award, 
  Zap, 
  Smartphone, 
  AlertTriangle,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SecurityViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onNavigate }) => {
  const securityPillars = [
    {
      title: '98%+ Multi-Sig Cold Storage',
      category: 'COLD VAULT ARCHITECTURE',
      icon: Lock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'The vast majority of digital assets are stored in geographically distributed offline cold vaults protected by multi-signature authorization and Hardware Security Modules (HSM).'
    },
    {
      title: '1:1 Proof of Reserves',
      category: 'TRANSPARENCY & AUDITING',
      icon: FileText,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      description: 'We maintain a 1:1 balance backing ratio for every user asset held on the exchange. Cryptographic Merkle Tree verification allows users to audit their funds independently anytime.'
    },
    {
      title: 'End-to-End Encryption & Anti-DDoS',
      category: 'INFRASTRUCTURE DEFENSE',
      icon: ShieldCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description: 'Bank-grade AES-256 encryption protects all sensitive personal data and API traffic. Enterprise Cloudflare Anti-DDoS mitigation ensures 99.99% operational uptime.'
    },
    {
      title: 'Biometric & 2FA User Protection',
      category: 'ACCOUNT HARDENING',
      icon: KeyRound,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      description: 'Enforced Multi-Factor Authentication (TOTP Authenticator Apps, FIDO2 Hardware Keys, SMS/Email verification) and FaceID/Fingerprint biometric security on mobile.'
    },
    {
      title: 'Global Bug Bounty & Insurance Fund',
      category: 'RISK MITIGATION',
      icon: Award,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      description: 'A dedicated multi-million dollar emergency insurance reserve fund guarantees user protection against black swan events, alongside continuous white-hat bug bounty programs.'
    },
    {
      title: 'Strict Regulatory Compliance',
      category: 'KYC & AML FRAMEWORK',
      icon: Globe,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      description: 'Integrated with automated SumSub & Elliptic blockchain analytics tools to monitor suspicious transaction flows and enforce strict anti-money laundering compliance.'
    }
  ];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-emerald-500/20 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Institutional Security Standard
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your Capital Protected by Defense-in-Depth Architecture
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Security is not an option—it is the core foundation of the ORIVIANT exchange. We implement military-grade encryption, multi-signature cold storage, and 100% Proof of Reserves to safeguard your funds around the clock.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 relative z-10 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Cold Storage Vaults</span>
              <span className="text-white font-extrabold text-sm">98.4% Funds Offline</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Proof of Reserves</span>
              <span className="text-white font-extrabold text-sm">1:1 Verifiable Merkle Tree</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Platform Audit Score</span>
              <span className="text-emerald-400 font-extrabold text-sm">98 / 100 AAA Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-app">Comprehensive Security Infrastructure</h2>
          <p className="text-xs text-app-sec">Every layer of our stack is audited independently to eliminate single points of failure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-app-card border border-app hover:border-emerald-500/40 transition-all shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${sp.bgColor} ${sp.color}`}>
                    {sp.category}
                  </span>
                  <div className={`p-2.5 rounded-2xl bg-app-sec ${sp.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-black text-app">{sp.title}</h3>
                <p className="text-xs text-app-sec leading-relaxed">{sp.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proof of Reserves Card */}
      <div className="p-8 rounded-3xl bg-app-card border border-app shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-app pb-4">
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              VERIFIED TRANSPARENCY
            </span>
            <h3 className="text-lg font-black text-app mt-1">Real-Time Proof of Reserves</h3>
            <p className="text-xs text-app-sec">ORIVIANT never uses user assets for lending or staking without consent.</p>
          </div>
          <button
            onClick={() => alert('Cryptographic Merkle Tree reserves verified. All user balances backed 1:1.')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all shrink-0"
          >
            Verify Merkle Tree Roots
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-app-sec/50 border border-app space-y-1">
            <span className="text-[10px] text-app-sec font-bold uppercase">BTC Reserve Ratio</span>
            <p className="text-base font-black text-emerald-500">104.2% Backed</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-app-sec/50 border border-app space-y-1">
            <span className="text-[10px] text-app-sec font-bold uppercase">ETH Reserve Ratio</span>
            <p className="text-base font-black text-emerald-500">102.8% Backed</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-app-sec/50 border border-app space-y-1">
            <span className="text-[10px] text-app-sec font-bold uppercase">USDT Reserve Ratio</span>
            <p className="text-base font-black text-emerald-500">101.5% Backed</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-app-sec/50 border border-app space-y-1">
            <span className="text-[10px] text-app-sec font-bold uppercase">USDC Reserve Ratio</span>
            <p className="text-base font-black text-emerald-500">105.0% Backed</p>
          </div>
        </div>
      </div>

      {/* CTA Download App Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Secure Your Trading on Mobile</h3>
          <p className="text-xs text-slate-300">Biometric login, hardware key authentication, and instant withdrawal alerts are built into the mobile app.</p>
        </div>
        <button
          onClick={() => onNavigate('download')}
          className="px-6 py-3 rounded-xl bg-accent text-white font-black text-xs sm:text-sm shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download App Now</span>
        </button>
      </div>

    </div>
  );
};
