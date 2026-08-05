import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  Zap, 
  UserPlus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Layers, 
  Server, 
  CheckCircle2, 
  Clock,
  Sparkles,
  PieChart,
  UserCheck,
  AlertCircle,
  BarChart2,
  Lock,
  Globe
} from 'lucide-react';

export const AdminDashboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 1. Main Executive Overview Banner KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* User Account Overview */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-app-sec uppercase tracking-wider">Registered & Active Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-app">142,890</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-2 border-t border-app/60 font-medium">
            <div>Online: <strong className="text-emerald-500 font-bold">14,210</strong></div>
            <div>DAU Active: <strong className="text-app font-bold">98,420</strong></div>
            <div>KYC Verified: <strong className="text-emerald-500 font-bold">127,170</strong></div>
            <div>Pending KYC: <strong className="text-amber-500 font-bold">1,480</strong></div>
          </div>
        </div>

        {/* Financial Deposits & Withdrawals */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-app-sec uppercase tracking-wider">Deposits & Withdrawals</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">$84.2M <span className="text-xs text-app-sec font-normal">Inflows</span></div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-2 border-t border-app/60 font-medium">
            <div>Success Dep: <strong className="text-emerald-500 font-bold">$84.2M</strong></div>
            <div>Pending Dep: <strong className="text-amber-500 font-bold">3 Req</strong></div>
            <div>Success Wth: <strong className="text-app font-bold">$32.4M</strong></div>
            <div>Pending Wth: <strong className="text-amber-500 font-bold">5 Req</strong></div>
          </div>
        </div>

        {/* Spot & Futures Trading Volume */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-app-sec uppercase tracking-wider">24h Platform Volume</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-app">$4.85 Billion</div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-2 border-t border-app/60 font-medium">
            <div>Futures Vol: <strong className="text-emerald-500 font-bold">$2.61B</strong></div>
            <div>Spot Vol: <strong className="text-accent font-bold">$1.92B</strong></div>
            <div>Live Trading: <strong className="text-app font-bold">$4.53B</strong></div>
            <div>Demo Trading: <strong className="text-amber-500 font-bold">$320M</strong></div>
          </div>
        </div>

        {/* Platform Revenue & Trading Fees */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-app-sec uppercase tracking-wider">Revenue & Trading Fees</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">$842,500 <span className="text-xs font-semibold">USDT</span></div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-2 border-t border-app/60 font-medium">
            <div>Trading Fees: <strong className="text-app font-bold">$710,200</strong></div>
            <div>Copy Performance: <strong className="text-emerald-500 font-bold">$132,300</strong></div>
            <div>System Latency: <strong className="text-emerald-500 font-bold">12ms</strong></div>
            <div>Health Status: <strong className="text-emerald-500 font-bold">100% Operational</strong></div>
          </div>
        </div>

      </div>

      {/* 2. Copy Trading Statistics & Top Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Copy Trading Overview */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Copy Trading Network Stats</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500">
              2 Pending Approval
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex justify-between items-center">
              <span className="text-app-sec">Total Copy Trading AUM</span>
              <span className="font-extrabold text-app font-mono">$320,210,000</span>
            </div>
            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex justify-between items-center">
              <span className="text-app-sec">Active Lead Traders</span>
              <span className="font-extrabold text-emerald-500">42 Verified Traders</span>
            </div>
            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex justify-between items-center">
              <span className="text-app-sec">Total Copiers Active</span>
              <span className="font-extrabold text-app">18,420 Users</span>
            </div>
            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex justify-between items-center">
              <span className="text-app-sec">Average Monthly Win Rate</span>
              <span className="font-extrabold text-emerald-500 font-mono">78.4%</span>
            </div>
          </div>
        </div>

        {/* Top Featured Assets */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Top Market Assets by 24h Volume</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { symbol: 'BTC/USDT', name: 'Bitcoin Futures', vol: '$2.14B', change: '+4.2%' },
              { symbol: 'ETH/USDT', name: 'Ethereum Spot', vol: '$1.12B', change: '+5.1%' },
              { symbol: 'SOL/USDT', name: 'Solana Futures', vol: '$480M', change: '+8.7%' },
              { symbol: 'XRP/USDT', name: 'Ripple Futures', vol: '$310M', change: '+2.1%' },
            ].map((asset, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-app block">{asset.symbol}</span>
                  <span className="text-[10px] text-app-sec">{asset.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-app block font-mono">{asset.vol}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">{asset.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Master Traders */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Top Featured Lead Traders</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { name: 'AlphaWhale Capital', roi: '+248.5%', copiers: '1,240', aum: '$42.5M' },
              { name: 'CryptoSatoshi', roi: '+184.2%', copiers: '980', aum: '$28.1M' },
              { name: 'Nexus Algo Fund', roi: '+142.0%', copiers: '840', aum: '$19.4M' },
              { name: 'MacroForex Master', roi: '+118.9%', copiers: '610', aum: '$12.0M' },
            ].map((trader, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-app block">{trader.name}</span>
                  <span className="text-[10px] text-app-sec">{trader.copiers} Copiers • {trader.aum} AUM</span>
                </div>
                <span className="font-extrabold text-emerald-500 font-mono text-sm">{trader.roi}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Platform Status & System Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Node Health */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-500" />
            <span>Infrastructure Node Health</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
              <div>
                <span className="font-bold text-app block">Order Matching Engine #1</span>
                <span className="text-[10px] text-app-sec">Tokyo Region (ap-northeast-1)</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% ONLINE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
              <div>
                <span className="font-bold text-app block">WebSocket Price Feed Engine</span>
                <span className="text-[10px] text-app-sec">London Region (eu-west-2)</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% ONLINE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
              <div>
                <span className="font-bold text-app block">Copy Trading Signal Router</span>
                <span className="text-[10px] text-app-sec">US East (us-east-1)</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Live Admin Audit Stream */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Recent Executive System Audit Activity</span>
            </h3>
            <span className="text-[11px] text-app-sec font-mono">Live Audit Stream</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { time: '2 mins ago', action: 'Withdrawal Status Approved', detail: 'Approved $12,500 USDT withdrawal for Elena Rostova', type: 'success' },
              { time: '14 mins ago', action: 'Demo Balance Reset', detail: 'Demo funds refilled to $10,000 USDT for user ID #892014', type: 'info' },
              { time: '45 mins ago', action: 'Security Audit Logged', detail: 'Admin session authenticated from IP 185.220.101.5', type: 'warning' },
              { time: '1 hour ago', action: 'Market Status Updated', detail: 'BTC/USDT Futures leverage tier updated to 125x', type: 'info' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-app-sec/30 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1 sm:mt-0 shrink-0 ${
                    item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-accent'
                  }`} />
                  <div>
                    <span className="font-bold text-app block sm:inline mr-2">{item.action}:</span>
                    <span className="text-app-sec text-[11px]">{item.detail}</span>
                  </div>
                </div>
                <span className="text-[10px] text-app-sec font-mono shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
