import React, { useState } from 'react';
import { 
  FileCode, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Terminal
} from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  service: string;
  message: string;
}

export const AdminSystemLogsTab: React.FC = () => {
  const [logs] = useState<LogEntry[]>([
    { id: '101', time: '15:35:12.402', level: 'INFO', service: 'MatchingEngine-1', message: 'Order #908124 matched: 0.25 BTC @ $94,250.00 USDT' },
    { id: '102', time: '15:34:55.120', level: 'INFO', service: 'AuthGateway', message: 'Admin authenticated successfully via session token (IP: 185.220.101.5)' },
    { id: '103', time: '15:33:10.891', level: 'WARN', service: 'CopyRouter', message: 'High volatility detected on SOL/USDT pair; slippage auto-adjusted to +0.05%' },
    { id: '104', time: '15:30:04.002', level: 'INFO', service: 'WebsocketFeed', message: 'Heartbeat ping ACK from Tokyo node (latency: 12ms)' },
    { id: '105', time: '15:25:40.510', level: 'ERROR', service: 'PaymentAPI', message: 'Third-party fiat gateway timeout on EUR deposit attempt (ref #98124)' },
    { id: '106', time: '15:20:11.200', level: 'INFO', service: 'DemoRefill', message: 'Demo account #892014 refilled balance to $10,000 USDT' },
  ]);

  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [search, setSearch] = useState('');

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
            placeholder="Search system audit traces..."
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
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-200">System Event Audit Stream</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Tail
          </span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
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
          ))}
        </div>
      </div>

    </div>
  );
};
