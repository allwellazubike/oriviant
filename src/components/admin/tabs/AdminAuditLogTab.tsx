import React, { useState } from 'react';
import { 
  FileCode, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  User, 
  Clock, 
  Laptop, 
  Globe, 
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  admin: string;
  action: string;
  affectedUser: string;
  affectedAsset: string;
  oldValue: string;
  newValue: string;
  date: string;
  time: string;
  ipAddress: string;
  device: string;
  level: 'INFO' | 'SECURITY' | 'CRITICAL';
}

export const AdminAuditLogTab: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-99104',
      admin: 'Executive Administrator (You)',
      action: 'Withdrawal Status Approved',
      affectedUser: 'Elena Rostova (#892014)',
      affectedAsset: 'USDT',
      oldValue: 'Under Review',
      newValue: 'Approved',
      date: '2026-08-04',
      time: '18:40:12',
      ipAddress: '185.220.101.5',
      device: 'MacBook Pro (macOS 14.5)',
      level: 'SECURITY'
    },
    {
      id: 'AUD-99103',
      admin: 'Executive Administrator (You)',
      action: 'Demo Balance Refill',
      affectedUser: 'David Kim (#114920)',
      affectedAsset: 'USDT (Demo)',
      oldValue: '$1,240.00',
      newValue: '$10,000.00',
      date: '2026-08-04',
      time: '17:22:05',
      ipAddress: '185.220.101.5',
      device: 'MacBook Pro (macOS 14.5)',
      level: 'INFO'
    },
    {
      id: 'AUD-99102',
      admin: 'Compliance Bot #02',
      action: 'KYC Level 2 Verified',
      affectedUser: 'Alex Thompson (#771029)',
      affectedAsset: 'Account Tier',
      oldValue: 'Unverified',
      newValue: 'Verified Level 2',
      date: '2026-08-04',
      time: '16:00:00',
      ipAddress: '10.0.4.12',
      device: 'Internal Automated Worker',
      level: 'INFO'
    },
    {
      id: 'AUD-99101',
      admin: 'Executive Administrator (You)',
      action: 'Market Max Leverage Adjusted',
      affectedUser: 'Global Futures Market',
      affectedAsset: 'BTC/USDT Futures',
      oldValue: '100x',
      newValue: '125x',
      date: '2026-08-04',
      time: '14:15:33',
      ipAddress: '185.220.101.5',
      device: 'MacBook Pro (macOS 14.5)',
      level: 'CRITICAL'
    },
    {
      id: 'AUD-99100',
      admin: 'Executive Administrator (You)',
      action: 'User Account Unsuspended',
      affectedUser: 'Marcus Vance (#339102)',
      affectedAsset: 'Account Status',
      oldValue: 'Suspended',
      newValue: 'Active',
      date: '2026-08-04',
      time: '11:05:44',
      ipAddress: '185.220.101.5',
      device: 'MacBook Pro (macOS 14.5)',
      level: 'SECURITY'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.affectedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.admin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || l.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-500" />
            <span>Executive Audit Trail & Action Logs</span>
          </h2>
          <p className="text-xs text-app-sec">Immutable system ledger recording every administrative state mutation, privilege escalation, and balance adjustment.</p>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-app-sec absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, user, admin..."
              className="w-full bg-app-sec border border-app rounded-xl pl-9 pr-3 py-2 text-xs text-app placeholder-app-sec focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">Info</option>
            <option value="SECURITY">Security</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>System Audit Activity Records ({filteredLogs.length})</span>
          </h3>
          <span className="text-xs font-mono text-app-sec">Hash Verified • SHA-256 Encrypted</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                <th className="pb-3 pl-2">Log ID</th>
                <th className="pb-3">Administrator</th>
                <th className="pb-3">Action Description</th>
                <th className="pb-3">Target User / Asset</th>
                <th className="pb-3">Old Value → New Value</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">IP Address & Device</th>
                <th className="pb-3 pr-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app/60 text-xs font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-app-sec/30 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-amber-500 text-xs">
                    {log.id}
                  </td>

                  <td className="py-3.5">
                    <div className="font-bold text-app">{log.admin}</div>
                  </td>

                  <td className="py-3.5 font-bold text-app">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold mr-2 ${
                      log.level === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                      log.level === 'SECURITY' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {log.level}
                    </span>
                    {log.action}
                  </td>

                  <td className="py-3.5 text-app">
                    <div className="font-bold">{log.affectedUser}</div>
                    <div className="text-[10px] text-app-sec">{log.affectedAsset}</div>
                  </td>

                  <td className="py-3.5 font-mono text-[11px]">
                    <span className="text-red-400 font-semibold">{log.oldValue}</span>
                    <span className="text-app-sec mx-1.5">→</span>
                    <span className="text-emerald-500 font-bold">{log.newValue}</span>
                  </td>

                  <td className="py-3.5 text-app-sec text-[11px] font-mono">
                    {log.date} <span className="text-[10px]">{log.time}</span>
                  </td>

                  <td className="py-3.5 text-app-sec text-[11px]">
                    <div className="font-mono text-app">{log.ipAddress}</div>
                    <div className="text-[10px] truncate max-w-[130px]">{log.device}</div>
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => setSelectedEntry(log)}
                      className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors"
                      title="View Full Entry JSON"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-extrabold text-app font-mono">Audit Log Payload – {selectedEntry.id}</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black/60 border border-app text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
              {JSON.stringify(selectedEntry, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
