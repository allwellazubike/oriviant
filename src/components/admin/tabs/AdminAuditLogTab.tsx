import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCode,
  Search,
  ShieldCheck,
  ChevronRight,
  X,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

export interface AuditLogEntry {
  id: number;
  admin_id: number | null;
  admin_email: string | null;
  admin_name: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

/** A rough severity classification so critical mutations still stand out visually, without a dedicated column in the schema. */
const levelFor = (action: string): 'INFO' | 'SECURITY' | 'CRITICAL' => {
  if (/WITHDRAWAL|DEPOSIT|BALANCE|SETTING|MAINTENANCE/i.test(action)) return 'SECURITY';
  if (/DELETE|SUSPEND|REJECT|DENY/i.test(action)) return 'CRITICAL';
  return 'INFO';
};

export const AdminAuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs();
      if (res.success && Array.isArray(res.logs)) {
        setLogs(res.logs);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((l) => {
    const level = levelFor(l.action);
    const haystack = `${l.action} ${l.admin_email || ''} ${l.admin_name || ''} ${l.target_type || ''} ${l.target_id || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || level === levelFilter;
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
          <p className="text-xs text-app-sec">Every administrative mutation — deposit/withdrawal decisions, market changes, user updates, settings, broadcasts — recorded as it happens.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-app-sec absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, admin, target..."
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

          <button onClick={fetchLogs} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors shrink-0" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>System Audit Activity Records ({filteredLogs.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-app-sec text-xs font-bold flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-accent" />
              Querying Postgres Database...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-app-sec text-xs font-bold">
              No audit activity recorded yet. Actions like approving a deposit or updating a setting will show up here.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                  <th className="pb-3 pl-2">Log ID</th>
                  <th className="pb-3">Administrator</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3 pr-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/60 text-xs font-medium">
                {filteredLogs.map((log) => {
                  const level = levelFor(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-app-sec/30 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-amber-500 text-xs">
                        AUD-{log.id}
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-app">{log.admin_name || log.admin_email || `User #${log.admin_id}`}</div>
                      </td>

                      <td className="py-3.5 font-bold text-app">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold mr-2 ${
                          level === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                          level === 'SECURITY' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {level}
                        </span>
                        {log.action.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 text-app">
                        <div className="font-bold">{log.target_type || '—'}</div>
                        <div className="text-[10px] text-app-sec font-mono">{log.target_id || ''}</div>
                      </td>

                      <td className="py-3.5 text-app-sec text-[11px] font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-app-sec text-[11px] font-mono">
                        {log.ip_address || '—'}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-sm font-extrabold text-app font-mono">Audit Log Payload – AUD-{selectedEntry.id}</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black/60 border border-app text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[60vh] overflow-y-auto">
              {JSON.stringify(selectedEntry, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
