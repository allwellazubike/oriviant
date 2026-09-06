import React from 'react';
import { 
  Building2, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Award, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Sparkles,
  Download
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface AboutViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const companyMilestones = [
    { year: '2021', title: 'Platform Inception', desc: 'Engineered next-gen sub-10ms matching engine for crypto spot trading.' },
    { year: '2022', title: 'Derivatives Expansion', desc: 'Launched 125x perpetual futures with institutional cross-margin liquidity.' },
    { year: '2023', title: 'Global Multi-Asset Launch', desc: 'Integrated Forex, Stocks, Gold, Silver, and Oil into unified global order books.' },
    { year: '2024', title: 'Pro Copy Trading System', desc: 'Introduced automated 1:1 copy trading with 85,000+ active lead traders.' },
    { year: '2025+', title: 'Institutional Expansion', desc: 'Achieved 1.8M+ verified global users across 165+ countries.' }
  ];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> About ORIVIANT Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Empowering Global Financial Freedom Through Innovation
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ORIVIANT is a leading global multi-asset exchange bridging traditional finance and decentralized digital assets. We provide institutional liquidity, sub-millisecond execution, and 1:1 proof of reserves for traders worldwide.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Global Users</span>
            <p className="text-xl sm:text-2xl font-black text-white">1.8M+</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Countries Covered</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">165+</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">24h Trading Volume</span>
            <p className="text-xl sm:text-2xl font-black text-white">$4.8B+</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Proof of Reserves</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400">1:1 Backed</p>
          </div>
        </div>
      </div>

      {/* Core Values / Pillars */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-app">Built on Four Uncompromising Pillars</h2>
          <p className="text-xs text-app-sec">Our architectural foundation ensures maximum performance and security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Institutional Liquidity',
              icon: Zap,
              color: 'text-amber-500',
              bgColor: 'bg-amber-500/10 border-amber-500/20',
              desc: 'Direct connectivity with Tier-1 liquidity providers ensuring tight spreads and zero order rejection.'
            },
            {
              title: 'Sub-10ms Latency',
              icon: Globe,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10 border-blue-500/20',
              desc: 'High-frequency matching engine deployed across co-located Equinix data centers worldwide.'
            },
            {
              title: 'Uncompromising Security',
              icon: ShieldCheck,
              color: 'text-emerald-500',
              bgColor: 'bg-emerald-500/10 border-emerald-500/20',
              desc: '100% cold storage for user funds with multi-signature key governance and 24/7 automated monitoring.'
            },
            {
              title: 'Global Compliance',
              icon: Award,
              color: 'text-purple-500',
              bgColor: 'bg-purple-500/10 border-purple-500/20',
              desc: 'Adhering strictly to international AML/KYC standards, regulatory frameworks, and independent audits.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-app">{item.title}</h3>
                <p className="text-xs text-app-sec leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="p-8 rounded-3xl bg-app-card border border-app shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-app pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-accent tracking-wider">Our Journey</span>
            <h3 className="text-lg font-black text-app">Milestones of Excellence</h3>
          </div>
          <span className="text-xs text-app-sec">Continuous Evolution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {companyMilestones.map((ms, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-app-sec/50 border border-app space-y-2">
              <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-accent text-white inline-block">
                {ms.year}
              </span>
              <h4 className="text-xs font-bold text-app">{ms.title}</h4>
              <p className="text-[11px] text-app-sec leading-relaxed">{ms.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-accent/10 via-app-card to-app-card border border-accent/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-app">Experience the ORIVIANT Ecosystem</h3>
          <p className="text-xs text-app-sec">Get the official ORIVIANT mobile app to manage your account and trade live markets.</p>
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
