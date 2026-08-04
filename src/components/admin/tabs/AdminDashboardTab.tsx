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
  Layers, 
  Server, 
  CheckCircle2, 
  Clock,
  Sparkles,
  PieChart
} from 'lucide-react';

export const AdminDashboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total & Active Users */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-sec uppercase tracking-wider">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-app">142,890</div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app/60">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> +1,240 Today
            </span>
            <span className="text-app-sec">89% Verified</span>
          </div>
        </div>

        {/* 24h Trading Volume */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-sec uppercase tracking-wider">24h Platform Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">$4,850,210,000</div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app/60">
            <span className="text-emerald-500 font-bold">+14.2% vs yesterday</span>
            <span className="text-app-sec">Spot + Futures</span>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-sec uppercase tracking-wider">24h Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-app">$842,500 USDT</div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app/60">
            <span className="text-amber-500 font-bold">Trading Fees</span>
            <span className="text-app-sec">0.02% Avg Margin</span>
          </div>
        </div>

        {/* System Health */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-sec uppercase tracking-wider">System Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">99.99%</div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app/60">
            <span className="text-app-sec">Latency: <strong className="text-emerald-500">12ms</strong></span>
            <span className="text-emerald-500 font-bold">0 Active Incidents</span>
          </div>
        </div>

      </div>

      {/* Breakdown Grid: Volume Channels & User Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trading Volume Channels */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Volume Channel Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-emerald-500">$4.85B Total</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-app">Futures Derivatives (USDT-M / Coin-M)</span>
                <span className="text-emerald-500 font-bold">$2,610,000,000 (53.8%)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '53.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-app">Spot Exchange Markets</span>
                <span className="text-accent font-bold">$1,920,000,000 (39.5%)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '39.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-app">Copy Trading Automated AUM</span>
                <span className="text-amber-500 font-bold">$320,210,000 (6.7%)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '6.7%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* User Account Statistics */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>User Account Categorization</span>
            </h3>
            <span className="text-xs font-bold text-app">142,890 Total</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-1">
              <span className="text-app-sec font-semibold block text-[11px]">Live Real Accounts</span>
              <span className="text-lg font-black text-app">30,490</span>
              <span className="text-[10px] text-emerald-500 font-bold block">Active Capital</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-1">
              <span className="text-app-sec font-semibold block text-[11px]">Simulator Demo Accounts</span>
              <span className="text-lg font-black text-app">112,400</span>
              <span className="text-[10px] text-accent font-bold block">$100k Virtual Funds</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-1">
              <span className="text-app-sec font-semibold block text-[11px]">KYC Level 2 Verified</span>
              <span className="text-lg font-black text-emerald-500">127,170</span>
              <span className="text-[10px] text-emerald-500 font-bold block">89% Platform Rate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-1">
              <span className="text-app-sec font-semibold block text-[11px]">Daily Active Users (DAU)</span>
              <span className="text-lg font-black text-amber-500">98,420</span>
              <span className="text-[10px] text-app-sec block">68.8% Engagement</span>
            </div>
          </div>
        </div>

      </div>

      {/* System Infrastructure & Audit Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Node Health */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-500" />
            <span>Infrastructure Health</span>
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
              { time: '2 mins ago', action: 'Lead Trader Approved', detail: 'Approved Lead Trader application for CryptoSatoshi (+184.2% ROI)', type: 'success' },
              { time: '14 mins ago', action: 'Demo Balance Reset', detail: 'Demo funds refilled to $100,000 USDT for user ID #892014', type: 'info' },
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
