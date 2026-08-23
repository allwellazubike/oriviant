import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Zap, 
  Sparkles,
  X
} from 'lucide-react';

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  recordsCount: string;
}

export const AdminReportsTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('users');
  const [format, setFormat] = useState<'CSV' | 'Excel' | 'PDF'>('CSV');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-04');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = [
    { id: 'users', name: 'User Master Directory', description: 'Complete user profiles, KYC status, balances, and security logs', recordsCount: '142,890 Users' },
    { id: 'deposits', name: 'Deposit Ledger', description: 'All crypto & fiat deposit inflows, TX hashes, and proof status', recordsCount: '48,120 Records' },
    { id: 'withdrawals', name: 'Withdrawal Ledger', description: 'Outflow withdrawal requests, on-chain TX hashes, and compliance notes', recordsCount: '29,410 Records' },
    { id: 'trading', name: 'Trading History', description: 'Spot & Futures order executions, fill prices, fees, and leverage', recordsCount: '1,420,800 Orders' },
    { id: 'revenue', name: 'Platform Revenue & Fees', description: 'Trading fee accruals, copy trading performance fees, and net yield', recordsCount: '$842,500 24h Yield' },
    { id: 'analytics', name: 'Traffic & Device Analytics', description: 'DAU/MAU trends, country traffic distribution, and device client breakdown', recordsCount: '98,420 DAU' },
    { id: 'reviews', name: 'Platform Reviews & Moderation', description: 'User reviews, ratings, verified volume tags, and moderation history', recordsCount: '1,240 Reviews' },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleGenerateReport = () => {
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) return;

    // Build dummy file content for browser download simulation
    const content = `Oriviant Enterprise Administrative Report\nReport Type: ${cat.name}\nFormat: ${format}\nDate Range: ${startDate} to ${endDate}\nGenerated At: ${new Date().toISOString()}\n\nSample Data Row 1, 1001, Verified, Success\nSample Data Row 2, 1002, Verified, Success\n`;
    
    const mimeType = format === 'CSV' ? 'text/csv' : format === 'Excel' ? 'application/vnd.ms-excel' : 'application/pdf';
    const ext = format === 'CSV' ? 'csv' : format === 'Excel' ? 'xls' : 'pdf';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Oriviant_${cat.name.replace(/\s+/g, '_')}_${startDate}_${endDate}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Generated and exported ${cat.name} as ${format} successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <span>Executive Enterprise Reporting & Data Export</span>
          </h2>
          <p className="text-xs text-app-sec">Generate compliance-grade exports in CSV, Excel, or PDF format with custom date filters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Selection List */}
        <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <h3 className="text-xs font-black text-app-sec uppercase tracking-wider">Select Export Dataset</h3>

          <div className="space-y-2">
            {categories.map((c) => {
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
                    <span className="text-[10px] font-mono text-amber-500 font-bold">{c.recordsCount}</span>
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
            <p className="text-xs text-app-sec">Target dataset: <strong className="text-app">{categories.find(c => c.id === selectedCategory)?.name}</strong></p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Format Selection */}
            <div>
              <label className="block font-bold text-app-sec mb-2">Export File Format</label>
              <div className="grid grid-cols-3 gap-3">
                {(['CSV', 'Excel', 'PDF'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`p-4 rounded-2xl border text-center font-extrabold text-xs transition-all ${
                      format === fmt
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-app-sec/40 border-app text-app-sec hover:text-app'
                    }`}
                  >
                    {fmt} Format
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
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

            {/* Security Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="font-extrabold text-amber-500 block text-xs">Security & Compliance Note</span>
              <p className="text-[11px] text-app-sec leading-relaxed">
                All generated export files contain hashed audit signatures and are logged in the Executive Audit Stream for security verification.
              </p>
            </div>

            {/* Export Action Button */}
            <div className="pt-4 border-t border-app flex items-center justify-end">
              <button
                onClick={handleGenerateReport}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download {format} Report</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
