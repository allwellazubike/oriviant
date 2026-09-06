import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Megaphone,
  X,
  RefreshCw
} from 'lucide-react';
import { adminApi } from '../../../api/admin';

interface BroadcastRow {
  id: number;
  title: string;
  message: string;
  severity: string;
  audience: string;
  recipient_count: number;
  sent_by_name: string | null;
  sent_by_email: string | null;
  created_at: string;
}

const AUDIENCE_LABELS: Record<string, string> = {
  all: 'All Platform Users',
  active_traders: 'Active Traders (Spot or Futures)'
};

export const AdminNotificationsTab: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [audience, setAudience] = useState<'all' | 'active_traders'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBroadcasts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getBroadcasts();
      if (res.success && Array.isArray(res.data)) {
        setBroadcasts(res.data);
      }
    } catch (error) {
      console.error('Failed to load broadcast history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      const res = await adminApi.sendBroadcast({ title: title.trim(), message: message.trim(), severity, audience });
      setTitle('');
      setMessage('');
      setToastMsg(res.message || 'Broadcast dispatched.');
      setTimeout(() => setToastMsg(null), 4000);
      await fetchBroadcasts();
    } catch (error: any) {
      setErrMsg(error?.message || 'Failed to send broadcast.');
      setTimeout(() => setErrMsg(null), 4000);
    } finally {
      setIsSending(false);
    }
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

      {errMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{errMsg}</span>
          <button onClick={() => setErrMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Broadcast Form */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Dispatch Platform-Wide Broadcast Announcement</span>
        </h3>
        <p className="text-[11px] text-app-sec -mt-2">
          Publishing writes a real notification row for every matching user and pushes it instantly to anyone currently connected.
        </p>

        <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-app-sec mb-1 uppercase tracking-wider text-[10px]">
              Announcement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance Notice / New Listing"
              required
              className="w-full bg-app-sec border border-app rounded-xl px-4 py-3 text-xs font-bold text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block font-bold text-app-sec mb-1 uppercase tracking-wider text-[10px]">
              Notification Body
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Provide clear, concise details for platform traders..."
              required
              className="w-full bg-app-sec border border-app rounded-xl p-3.5 text-xs font-medium text-app focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-app-sec mb-1 uppercase tracking-wider text-[10px]">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
              >
                <option value="info">Info / General News</option>
                <option value="warning">Warning / Maintenance Alert</option>
                <option value="success">Success / Promotion</option>
                <option value="alert">Critical Security Alert</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-app-sec mb-1 uppercase tracking-wider text-[10px]">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
              >
                <option value="all">All Platform Users</option>
                <option value="active_traders">Active Traders (Spot or Futures)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSending ? 'Publishing...' : 'Publish Broadcast Banner'}</span>
          </button>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent" />
            <span>Broadcast Log History</span>
          </h3>
          <button onClick={fetchBroadcasts} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-app-sec text-xs font-bold">Loading broadcast history...</div>
        ) : broadcasts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-app-sec/30 border border-app text-center text-xs text-app-sec">
            No broadcasts sent yet.
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-app-sec/30 border border-app flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-app">{b.title}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                      b.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                      b.severity === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      b.severity === 'alert' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {b.severity}
                    </span>
                  </div>
                  <p className="text-xs text-app-sec">{b.message}</p>
                  <div className="text-[10px] text-app-sec font-mono pt-1">
                    Sent to: <strong>{AUDIENCE_LABELS[b.audience] || b.audience}</strong> ({b.recipient_count} recipients) • {new Date(b.created_at).toLocaleString()}
                    {b.sent_by_name && <> • by {b.sent_by_name}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
