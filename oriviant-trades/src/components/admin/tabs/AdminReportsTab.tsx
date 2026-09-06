import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';
import { API_BASE_URL } from '../../../api/client';

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
}

const CATEGORIES: ReportCategory[] = [
  { id: 'users', name: 'User Master Directory', description: 'Every registered account, role, and join date.' },
  { id: 'deposits', name: 'Deposit Ledger', description: 'All crypto deposit requests, TX hashes, and status.' },
  { id: 'withdrawals', name: 'Withdrawal Ledger', description: 'Outflow withdrawal requests and their on-chain TX hashes.' },
  { id: 'trading', name: 'Trading History', description: 'Spot order executions, fill prices, and fees.' },
  { id: 'revenue', name: 'Platform Revenue & Fees', description: 'Daily breakdown of spot, withdrawal, and copy-trading fee revenue.' },
  { id: 'analytics', name: 'Login Activity', description: 'Daily active users and login success/failure counts.' },
  { id: 'reviews', name: 'Platform Reviews & Moderation', description: 'No review system is wired up yet — exports empty.' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthAgoIso = () => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export const AdminReportsTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('users');
  const [startDate, setStartDate] = useState(monthAgoIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  useEffect(() => {
    adminApi.getReportCounts()
      .then((res) => { if (res.success) setCounts(res.data); })
      .catch((err) => console.error('Failed to load report counts:', err))
      .finally(() => setIsLoadingCounts(false));
  }, []);

  const formatCount = (id: string): string => {
    if (isLoadingCounts) return '...';
    const n = counts[id];
    if (n === undefined) return '—';
    if (id === 'revenue') return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} Total Fees`;
    return `${n.toLocaleString()} Records`;
  };

  const handleGenerateReport = async () => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return;

    setIsExporting(true);
    try {
      const token = localStorage.getItem('oriviant_token') || sessionStorage.getItem('oriviant_token');
      const url = `${API_BASE_URL}/admin/reports/export?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Export failed.');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Oriviant_${cat.name.replace(/\s+/g, '_')}_${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setToastMsg(`Exported ${cat.name} (${startDate} to ${endDate}) successfully!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (error: any) {
      setErrMsg(error?.message || 'Failed to generate report.');
      setTimeout(() => setErrMsg(null), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notices */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {errMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{errMsg}</span>
          <button onClick={() => setErrMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm">
        <h2 className="text-base font-extrabold text-app flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          <span>Enterprise Reporting & Data Export</span>
        </h2>
        <p className="text-xs text-app-sec">Generate real CSV exports from the live database, filtered by date range.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category Selection List */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-xs font-black text-app-sec uppercase tracking-wider">Select Export Dataset</h3>

          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-app shadow-sm'
                      : 'bg-app-sec/40 border-app text-app-sec hover:text-app hover:bg-app-sec/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">{c.name}</span>
                    <span className="text-[10px] font-mono text-amber-500 font-bold">{formatCount(c.id)}</span>
                  </div>
                  <p className="text-[11px] text-app-sec leading-snug">{c.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Configuration Panel */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-6">
          <div className="border-b border-app pb-4">
            <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Configure Export Parameters</span>
            </h3>
            <p className="text-xs text-app-sec">Target dataset: <strong className="text-app">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong></p>
          </div>

          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-app-sec mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs text-app focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-app-sec mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs text-app focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500 block text-xs">Format</span>
              <p className="text-[11px] text-app-sec leading-relaxed">
                Exports as CSV, which opens directly in Excel, Google Sheets, or Numbers. Each export is limited to 5,000 rows.
              </p>
            </div>

            <div className="pt-4 border-t border-app flex items-center justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={isExporting}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-60"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'Generating...' : 'Generate & Download CSV Report'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
