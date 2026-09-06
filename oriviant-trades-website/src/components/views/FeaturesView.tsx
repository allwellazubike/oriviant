import React from 'react';
import { 
  Layers, 
  Zap, 
  Users, 
  RefreshCw, 
  BarChart2, 
  ArrowUpRight, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  Headphones, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  Lock, 
  TrendingUp,
  Download
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface FeaturesViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const FeaturesView: React.FC<FeaturesViewProps> = ({ onNavigate }) => {
  const featuresList = [
    {
      id: 'spot',
      title: 'Spot Trading Engine',
      category: 'MARKETS & EXECUTION',
      icon: Layers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description: 'Ultra-fast order execution for 250+ crypto pairs, forex, commodities, and equities with sub-10ms matching engine latency.',
      highlights: ['Deep Order Book Liquidity', 'Zero Deposit Fees', 'Instant Market & Limit Orders', 'Advanced Algo Orders (OCO, Stop-Limit)']
    },
    {
      id: 'futures',
      title: 'Perpetual Futures 125x',
      category: 'DERIVATIVES',
      icon: Zap,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20',
      description: 'Trade perpetual contracts with flexible leverage up to 125x, cross and isolated margin modes, and real-time liquidation protection.',
      highlights: ['Flexible 1x - 125x Leverage', 'Cross & Isolated Margin', 'Automated Trailing Stops', 'Negative Balance Protection']
    },
    {
      id: 'copy-trading',
      title: 'Automated Copy Trading',
      category: 'SOCIAL TRADING',
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Follow top-performing global lead traders. Automatically mirror their exact trades in real-time with customizable risk parameters.',
      highlights: ['Verified Track Record Audits', 'Custom Stop-Loss Per Trader', '1-Click Auto Replication', '0% Management Surcharges']
    },
    {
      id: 'demo',
      title: 'Risk-Free Demo Workspace',
      category: 'PRACTICE ENVIRONMENT',
      icon: RefreshCw,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      description: 'Refine your trading strategies in a simulated live-market environment funded with $10,000 in renewable virtual capital.',
      highlights: ['100% Real-Time Market Simulation', 'One-Tap Fund Refill', 'Zero Risk to Real Capital', 'Identical Order Match Engine']
    },
    {
      id: 'charts',
      title: 'Advanced TradingView Charts',
      category: 'TECHNICAL ANALYSIS',
      icon: BarChart2,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Professional charting suite with 100+ technical indicators, drawing tools, multi-timeframe analysis, and Smart Money Concepts.',
      highlights: ['100+ Technical Indicators', 'Multi-Chart Layouts', 'Custom Drawing Tools', 'Order Block & FVG Detection']
    },
    {
      id: 'withdrawals',
      title: 'Automated Instant Withdrawals',
      category: 'FUND MANAGEMENT',
      icon: Clock,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      description: 'Experience lightning-fast payout approvals with automated hot-wallet processing for crypto assets and seamless fiat gateway integration.',
      highlights: ['Sub-2 Minute Processing', 'Multi-Chain Crypto Payouts', 'Zero Hidden Payout Fees', 'Transparent Tx Hash Tracking']
    },
    {
      id: 'security',
      title: 'Institutional Grade Security',
      category: 'ASSET PROTECTION',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Multi-signature cold storage vaults, 1:1 asset backing, hardware security modules (HSM), and continuous third-party audits.',
      highlights: ['1:1 Proof of Reserves', 'Multi-Sig Cold Storage', 'Biometric & 2FA Auth', 'Bug Bounty & Insurance Fund']
    },
    {
      id: 'multi-asset',
      title: 'Unified Multi-Asset Hub',
      category: 'MARKET COVERAGE',
      icon: Globe,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      description: 'Trade Crypto, Forex, Stocks, Gold, Silver, Crude Oil, ETFs, and World Indices seamlessly from a single unified account.',
      highlights: ['250+ Crypto Tokens', '45+ Forex Currency Pairs', 'Global Equities & Indices', 'Precious Metals & Energy']
    },
    {
      id: 'ai-insights',
      title: 'AI Market Intelligence',
      category: 'SMART ANALYTICS',
      icon: Sparkles,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10 border-pink-500/20',
      description: 'Real-time sentiment scoring, automated pattern detection, Fear & Greed indexing, and institutional order flow tracking.',
      highlights: ['Fear & Greed Sentiment Index', 'Algorithmic Pattern Detection', 'Institutional Flow Alerts', 'Daily Market Summaries']
    },
    {
      id: 'support',
      title: '24/7 Priority Support',
      category: 'CUSTOMER CARE',
      icon: Headphones,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      description: 'Dedicated multi-lingual support team standing by round-the-clock via live chat, email, and VIP account manager access.',
      highlights: ['Sub-30 Second Response Time', '12+ Global Languages Supported', 'Dedicated VIP Managers', 'Comprehensive Knowledge Base']
    }
  ];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden text-center space-y-4">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-black uppercase tracking-wider relative z-10">
          <Sparkles className="w-4 h-4" /> Platform Features & Capabilities
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight relative z-10">
          Engineered for Superior Execution
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed relative z-10">
          Discover why millions of traders trust ORIVIANT for institutional liquidity, lightning-fast order matching, multi-asset coverage, and unmatched asset protection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 relative z-10">
          <button
            onClick={() => onNavigate('download')}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-accent/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Mobile App</span>
          </button>
          <button
            onClick={() => onNavigate('markets')}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Explore Live Markets</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 10 Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresList.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className="p-6 rounded-3xl bg-app-card border border-app hover:border-accent/40 transition-all shadow-sm space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${feat.bgColor} ${feat.color}`}>
                    {feat.category}
                  </span>
                  <div className={`p-2.5 rounded-2xl bg-app-sec group-hover:scale-110 transition-transform ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-black text-app group-hover:text-accent transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs text-app-sec leading-relaxed">
                  {feat.description}
                </p>

                <div className="pt-2 border-t border-app space-y-2">
                  {feat.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-app font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('download')}
                  className="w-full py-2.5 rounded-xl bg-app-sec hover:bg-accent hover:text-white text-app font-bold text-xs border border-app transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Trade This on Mobile App</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div className="p-8 rounded-3xl bg-app-card border border-app shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-black text-app">Ready to Start Trading with ORIVIANT?</h3>
          <p className="text-xs text-app-sec">Download our mobile application to access live spot & futures trading on iOS and Android.</p>
        </div>
        <button
          onClick={() => onNavigate('download')}
          className="px-6 py-3 rounded-xl bg-accent text-white font-black text-xs sm:text-sm shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all shrink-0"
        >
          Download App Now
        </button>
      </div>

    </div>
  );
};
