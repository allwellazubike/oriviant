import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface AnalyticsData {
  mau: { current: number; changePct: number | null };
  volume30d: { total: number; spot: number; futures: number; changePct: number | null };
  revenue30d: { total: number; spotFees: number; withdrawalFees: number; copyTradingFees: number; netFeeMarginPct: number };
  avgSessionSeconds: number;
}

const formatUsd = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)} Billion`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)} Million`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const formatSession = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
};

const ChangeBadge: React.FC<{ pct: number | null; positiveIsGood?: boolean }> = ({ pct, positiveIsGood = true }) => {
  if (pct === null) {
    return <p className="text-[10px] text-app-sec font-medium">No prior-period data yet</p>;
  }
  const isPositive = pct >= 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`text-[10px] font-bold flex items-center gap-1 ${isGood ? 'text-emerald-500' : 'text-red-500'}`}>
      <Icon className="w-3.5 h-3.5" /> {isPositive ? '+' : ''}{pct.toFixed(1)}% vs prior 30 days
    </p>
  );
};

export const AdminAnalyticsTab: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">

      {/* Top Growth Cards */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-app">Platform Analytics (Live)</h3>
        <button onClick={fetchAnalytics} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">Monthly Active Users (MAU)</span>
          <div className="text-2xl sm:text-3xl font-black text-app">
            {isLoading ? '—' : data?.mau.current.toLocaleString() ?? '0'}
          </div>
          {isLoading ? <p className="text-[10px] text-app-sec">Loading...</p> : <ChangeBadge pct={data?.mau.changePct ?? null} />}
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">30D Trading Volume</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">
            {isLoading ? '—' : formatUsd(data?.volume30d.total ?? 0)}
          </div>
          {isLoading ? <p className="text-[10px] text-app-sec">Loading...</p> : <ChangeBadge pct={data?.volume30d.changePct ?? null} />}
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">30D Platform Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {isLoading ? '—' : formatUsd(data?.revenue30d.total ?? 0)}
          </div>
          <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {isLoading ? 'Loading...' : `Net Fee Margin ${(data?.revenue30d.netFeeMarginPct ?? 0).toFixed(3)}%`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
          <span className="text-xs font-bold text-app-sec uppercase">Average Session Time</span>
          <div className="text-2xl sm:text-3xl font-black text-app">
            {isLoading ? '—' : formatSession(data?.avgSessionSeconds ?? 0)}
          </div>
          <p className="text-[10px] text-app-sec font-medium">
            From login to last active request, last 30 days
          </p>
        </div>

      </div>

      {/* Revenue Breakdown */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app">30D Revenue Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-app-sec font-bold block mb-1">Spot Trading Fees</span>
            <span className="text-app font-extrabold">{isLoading ? '—' : formatUsd(data?.revenue30d.spotFees ?? 0)}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-app-sec font-bold block mb-1">Withdrawal Fees</span>
            <span className="text-app font-extrabold">{isLoading ? '—' : formatUsd(data?.revenue30d.withdrawalFees ?? 0)}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-app-sec font-bold block mb-1">Copy Trading Profit Share</span>
            <span className="text-app font-extrabold">{isLoading ? '—' : formatUsd(data?.revenue30d.copyTradingFees ?? 0)}</span>
          </div>
        </div>
        <p className="text-[10px] text-app-sec">
          Futures contracts don't currently record a fee on open/close, so futures revenue isn't included here yet.
        </p>
      </div>

      {/* Traffic & Device Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Device Breakdown */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-accent" />
            <span>Device & Access Point Distribution</span>
          </h3>
          <p className="text-[11px] text-app-sec">
            Device and geographic breakdowns need page-view/session tracking that isn't wired up yet — not shown here rather than shown with fabricated numbers.
          </p>
        </div>

        {/* Regional Traffic Distribution */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Top Geographic Regions</span>
          </h3>
          <p className="text-[11px] text-app-sec">
            Same limitation — this platform doesn't currently do IP geolocation on logins, so regional traffic has no real source yet.
          </p>
        </div>

      </div>

    </div>
  );
};
