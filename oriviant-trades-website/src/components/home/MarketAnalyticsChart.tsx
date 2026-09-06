import React, { useState } from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import { AssetIcon } from '../common/AssetIcon';

export const MarketAnalyticsChart: React.FC = () => {
  const [activePointIndex, setActivePointIndex] = useState(6);

  const pointsData = [
    { time: '00:00', label: '$14,210,000,000' },
    { time: '04:00', label: '$14,850,200,000' },
    { time: '08:00', label: '$15,340,500,000' },
    { time: '12:00', label: '$15,100,800,000' },
    { time: '16:00', label: '$15,920,400,000' },
    { time: '20:00', label: '$16,400,000,000' },
    { time: '24:00', label: '$16,644,561,384' },
  ];

  return (
    <div className="py-8 space-y-8">
      
      {/* Heading */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          GLOBAL EXCHANGE METRICS
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-app">How we move the markets</h2>
        <p className="text-xs text-app-sec">Institutional depth and high-throughput order execution speed.</p>
      </div>

      {/* Grid of Platform Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 24H Trading Volume Card */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-app-card border border-app text-app space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            <div>
              <span className="text-xs text-app-sec font-bold uppercase tracking-wider block">24h trading volume</span>
              <div className="text-2xl sm:text-4xl font-black text-app tracking-tight mt-1 flex items-center gap-2">
                <span>{pointsData[activePointIndex].label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +14.2%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-500">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Live Feed</span>
            </div>
          </div>

          {/* Redesigned Area Chart Container */}
          <div className="h-48 w-full relative pt-2 overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="lineAccent" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00d2ff" />
                </linearGradient>
              </defs>

              {/* Smooth SVG Filled Area */}
              <path
                d="M 0 160 Q 90 110 180 125 T 360 60 T 480 40 T 600 15 L 600 200 L 0 200 Z"
                fill="url(#volumeGlow)"
              />

              {/* Smooth Animated Line */}
              <path
                d="M 0 160 Q 90 110 180 125 T 360 60 T 480 40 T 600 15"
                fill="none"
                stroke="url(#lineAccent)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Pulse Marker at Current Point */}
              <circle cx="600" cy="15" r="6" fill="#00d2ff" className="animate-ping" opacity="0.8" />
              <circle cx="600" cy="15" r="4" fill="#ffffff" />
            </svg>
          </div>

          {/* Time axis ticks */}
          <div className="flex justify-between text-[11px] text-app-sec font-mono pt-2 border-t border-app">
            {pointsData.map((pt, i) => (
              <span
                key={i}
                onClick={() => setActivePointIndex(i)}
                className={`cursor-pointer transition-colors ${activePointIndex === i ? 'text-cyan-500 font-bold' : 'hover:text-app'}`}
              >
                {pt.time}
              </span>
            ))}
          </div>

        </div>

        {/* Right Stats Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Active Traders Card */}
          <div className="p-5 rounded-2xl bg-app-card border border-app space-y-3 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[11px] text-app-sec font-bold uppercase tracking-wider block">Active traders</span>
              <div className="text-2xl sm:text-3xl font-black text-app tracking-tight mt-1">4,308,884</div>
            </div>

            {/* Overlapping Avatars */}
            <div className="pt-2 border-t border-app flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-app-card object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Trader 1" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-app-card object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Trader 2" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-app-card object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="Trader 3" />
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-app-card shadow-sm">
                  +4M
                </div>
              </div>
            </div>
          </div>

          {/* Supported Trading Pairs Card */}
          <div className="p-5 rounded-2xl bg-app-card border border-app space-y-3 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[11px] text-app-sec font-bold uppercase tracking-wider block">Trading pairs</span>
              <div className="text-2xl sm:text-3xl font-black text-app tracking-tight mt-1">2,553</div>
            </div>

            {/* Overlapping Official Crypto & Asset Logos */}
            <div className="pt-2 border-t border-app flex items-center -space-x-2">
              <div className="ring-2 ring-app-card rounded-full shadow-lg">
                <AssetIcon symbol="BTC" size="md" />
              </div>
              <div className="ring-2 ring-app-card rounded-full shadow-lg">
                <AssetIcon symbol="ETH" size="md" />
              </div>
              <div className="ring-2 ring-app-card rounded-full shadow-lg">
                <AssetIcon symbol="SOL" size="md" />
              </div>
              <div className="ring-2 ring-app-card rounded-full shadow-lg">
                <AssetIcon symbol="DOGE" size="md" />
              </div>
              <div className="w-8 h-8 rounded-full bg-app-sec border border-app flex items-center justify-center text-[10px] font-bold text-app-sec ring-2 ring-app-card shadow-lg">
                +2.5K
              </div>
            </div>
          </div>

          {/* Countries Card */}
          <div className="p-5 rounded-2xl bg-app-card border border-app space-y-1 shadow-md">
            <span className="text-[11px] text-app-sec font-bold uppercase tracking-wider block">Countries Served</span>
            <div className="text-2xl sm:text-3xl font-black text-app tracking-tight">165+</div>
            <p className="text-[11px] text-app-sec">Global jurisdictional compliance.</p>
          </div>

          {/* Matching Speed Card */}
          <div className="p-5 rounded-2xl bg-app-card border border-app space-y-1 shadow-md">
            <span className="text-[11px] text-app-sec font-bold uppercase tracking-wider block">Matching Speed</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-500 tracking-tight">&lt;1.8ms</div>
            <p className="text-[11px] text-app-sec">Sub-millisecond latency.</p>
          </div>

        </div>

      </div>

    </div>
  );
};
