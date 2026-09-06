import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface LedgerRow {
  id: number;
  user_id: number;
  asset_symbol: string;
  delta: string;
  balance_after: string;
  reason: string;
  ref_type: string | null;
  ref_id: number | null;
  email: string | null;
  nickname: string | null;
  created_at: string;
}

interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
}

/** Real ledger reasons mapped to the subsystem that actually wrote them. */
const SERVICE_BY_REF_TYPE: Record<string, string> = {
  order: 'MatchingEngine',
  deposit: 'PaymentGateway',
  withdrawal: 'PaymentGateway',
  futures_position: 'FuturesEngine',
  transfer: 'WalletService',
  copy_position: 'CopyRouter'
};

const levelFor = (reason: string, delta: number): 'INFO' | 'WARN' | 'ERROR' => {
  if (/REJECTED|DENIED|FAILED/i.test(reason)) return 'WARN';
  if (/FUTURES_CLOSE_PNL/.test(reason) && delta < 0) return 'WARN';
  return 'INFO';
};

const messageFor = (row: LedgerRow): string => {
  const who = row.nickname || row.email || `user #${row.user_id}`;
  const delta = Number(row.delta);
  const amount = `${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${row.asset_symbol}`;

  switch (row.reason) {
    case 'TRADE_BUY': return `${who} bought ${amount} (order #${row.ref_id})`;
    case 'TRADE_SELL': return `${who} sold ${amount} (order #${row.ref_id})`;
    case 'DEPOSIT_APPROVED': return `Deposit credited to ${who}: +${amount}`;
    case 'WITHDRAWAL_APPROVED': return `Withdrawal completed for ${who}: -${amount}`;
    case 'WITHDRAWAL_DENIED': return `Withdrawal denied for ${who}, funds released`;
    case 'WITHDRAWAL_REJECTED_REFUND': return `Withdrawal rejected for ${who}, ${amount} refunded`;
    case 'FUTURES_CLOSE_PNL': return `${who} closed a futures position: ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} USDT`;
    case 'INTERNAL_TRANSFER': return `${who} transferred ${amount} between wallets`;
    default: return `${row.reason.replace(/_/g, ' ').toLowerCase()} — ${who}: ${delta >= 0 ? '+' : ''}${amount}`;
  }
};

const mapRow = (row: LedgerRow): LogEntry => ({
  id: row.id.toString(),
  time: new Date(row.created_at).toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  level: levelFor(row.reason, Number(row.delta)),
  service: SERVICE_BY_REF_TYPE[row.ref_type || ''] || 'LedgerService',
  message: messageFor(row)
});

export const AdminSystemLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getLedgerLogs();
      if (res.success && Array.isArray(res.logs)) {
        setLogs(res.logs.map(mapRow));
      }
    } catch (error) {
      console.error('Failed to load system logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = logs.filter(l => {
    if (filterLevel !== 'ALL' && l.level !== filterLevel) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.service.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search system event traces..."
            className="w-full bg-app-sec border border-app rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-app focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                filterLevel === lvl ? 'bg-amber-500 text-white shadow-sm' : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              {lvl}
            </button>
          ))}
          <button onClick={fetchLogs} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors shrink-0" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-200">System Ledger Event Stream</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Auto-refreshing
          </span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-10 text-center text-slate-500 text-xs">Loading ledger stream...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">No balance-affecting events recorded yet.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-slate-500 shrink-0 text-[10px]">{log.time}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold shrink-0 ${
                  log.level === 'INFO' ? 'bg-blue-500/20 text-blue-400' :
                  log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {log.level}
                </span>
                <span className="text-amber-300 font-bold shrink-0">[{log.service}]</span>
                <span className="text-slate-200 truncate">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
