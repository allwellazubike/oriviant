import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Smartphone, 
  Monitor, 
  Globe, 
  DollarSign, 
  PieChart,
  ArrowUpRight
} from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Top Growth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">Monthly Active Users (MAU)</span>
          <div className="text-2xl sm:text-3xl font-black text-app">142,890</div>
          <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this month
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">30D Trading Volume</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">$138.4 Billion</div>
          <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +22.1% vs prev month
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">30D Platform Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">$24,850,000</div>
          <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Net Fee Margin 0.02%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">Average Session Time</span>
          <div className="text-2xl sm:text-3xl font-black text-app">34m 12s</div>
          <p className="text-[10px] text-app-sec font-medium">
            High Trader Engagement
          </p>
        </div>

      </div>

      {/* Traffic & Device Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Breakdown */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-accent" />
            <span>Device & Access Point Distribution</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="flex items-center gap-2 text-app">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> Android APK App
                </span>
                <span className="text-emerald-500">54% (77,160 users)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="flex items-center gap-2 text-app">
                  <Monitor className="w-4 h-4 text-accent" /> Desktop Web Terminal
                </span>
                <span className="text-accent">38% (54,290 users)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="flex items-center gap-2 text-app">
                  <Globe className="w-4 h-4 text-amber-500" /> Mobile Web Browser
                </span>
                <span className="text-amber-500">8% (11,440 users)</span>
              </div>
              <div className="w-full h-2.5 bg-app-sec rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Regional Traffic Distribution */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Top Geographic Regions</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { region: 'Asia Pacific (Japan, S. Korea, SG)', share: '42.5%', volume: '$2.06B 24h' },
              { region: 'Europe (Germany, UK, France)', share: '31.2%', volume: '$1.51B 24h' },
              { region: 'Latin America & Middle East', share: '18.3%', volume: '$880M 24h' },
              { region: 'Other Global Markets', share: '8.0%', volume: '$390M 24h' },
            ].map((geo, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
                <span className="font-bold text-app">{geo.region}</span>
                <div className="text-right font-mono">
                  <span className="font-extrabold text-accent block">{geo.share}</span>
                  <span className="text-[10px] text-app-sec">{geo.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
