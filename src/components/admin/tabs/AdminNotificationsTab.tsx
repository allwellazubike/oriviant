import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Megaphone, 
  X, 
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';

export const AdminNotificationsTab: React.FC = () => {
  const { addSystemNotification } = useNotifications();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [audience, setAudience] = useState('All Platform Users');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [recentBroadcasts, setRecentBroadcasts] = useState([
    { id: '1', title: 'System Maintenance Scheduled', message: 'Futures order matching engine upgrade at 02:00 UTC tomorrow. Expected duration: 10 mins.', type: 'warning', date: 'Today 14:20', audience: 'All Users' },
    { id: '2', title: 'New Trading Pair Listed: SOL/USDT Futures', message: 'SOL/USDT Futures with up to 125x leverage is now live on Oriviant Exchange!', type: 'success', date: 'Yesterday', audience: 'All Users' },
  ]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    // Trigger notification context
    addSystemNotification(title, message, type);

    const newBroadcast = {
      id: Date.now().toString(),
      title,
      message,
      type,
      date: 'Just now',
      audience
    };

    setRecentBroadcasts([newBroadcast, ...recentBroadcasts]);
    setTitle('');
    setMessage('');
    setToastMsg(`Broadcast alert "${title}" dispatched to ${audience}!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Broadcast Form */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Dispatch Platform-Wide Broadcast Announcement</span>
        </h3>

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
                value={type}
                onChange={(e) => setType(e.target.value as any)}
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
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
              >
                <option>All Platform Users</option>
                <option>Level 2 KYC Verified Users</option>
                <option>Active Futures Traders</option>
                <option>VIP Tier 1-5 Members</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Publish Broadcast Banner</span>
          </button>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <span>Broadcast Log History</span>
        </h3>

        <div className="space-y-3">
          {recentBroadcasts.map((b) => (
            <div key={b.id} className="p-4 rounded-2xl bg-app-sec/30 border border-app flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-app">{b.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                    b.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    b.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {b.type}
                  </span>
                </div>
                <p className="text-xs text-app-sec">{b.message}</p>
                <div className="text-[10px] text-app-sec font-mono pt-1">
                  Sent to: <strong>{b.audience}</strong> • {b.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
