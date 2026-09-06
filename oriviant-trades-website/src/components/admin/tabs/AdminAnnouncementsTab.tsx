import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  ShieldAlert, 
  X, 
  Calendar,
  Layers,
  Trash2,
  Edit
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Maintenance Notices' | 'Market Alerts' | 'Promotions' | 'Platform Updates' | 'Security Alerts' | 'Push Notifications';
  message: string;
  targetAudience: 'All Users' | 'Live Accounts' | 'Demo Accounts' | 'VIP Members' | 'Lead Traders';
  status: 'Active' | 'Scheduled' | 'Ended' | 'Draft';
  scheduledDate?: string;
  scheduledTime?: string;
  createdDate: string;
  impressions: number;
}

export const AdminAnnouncementsTab: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ANN-101',
      title: 'Scheduled Engine Maintenance – Aug 10',
      category: 'Maintenance Notices',
      message: 'Oriviant matching engine will undergo a scheduled 10-minute maintenance on Aug 10, 02:00 UTC.',
      targetAudience: 'All Users',
      status: 'Active',
      createdDate: '2026-08-04',
      impressions: 42100
    },
    {
      id: 'ANN-102',
      title: 'New Futures Contract Listed: SUI/USDT 125x',
      category: 'Market Alerts',
      message: 'SUI/USDT perpetual contract is now live with up to 125x leverage and 0% maker fee for 7 days.',
      targetAudience: 'All Users',
      status: 'Active',
      createdDate: '2026-08-03',
      impressions: 89400
    },
    {
      id: 'ANN-103',
      title: 'VIP Fee Rebate Competition Kickoff',
      category: 'Promotions',
      message: 'Trade $50,000+ volume this week to enter the $10,000 USDT reward pool.',
      targetAudience: 'Live Accounts',
      status: 'Scheduled',
      scheduledDate: '2026-08-08',
      scheduledTime: '12:00',
      createdDate: '2026-08-04',
      impressions: 0
    },
    {
      id: 'ANN-104',
      title: 'Mandatory Security 2FA Verification Notice',
      category: 'Security Alerts',
      message: 'Ensure 2FA is active on your account before requesting external withdrawal requests.',
      targetAudience: 'All Users',
      status: 'Active',
      createdDate: '2026-08-01',
      impressions: 124000
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementItem['category']>('Platform Updates');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<AnnouncementItem['targetAudience']>('All Users');
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newItem: AnnouncementItem = {
      id: `ANN-${Date.now().toString().slice(-3)}`,
      title,
      category,
      message,
      targetAudience,
      status: scheduleNow ? 'Active' : 'Scheduled',
      scheduledDate: scheduleNow ? undefined : scheduledDate,
      scheduledTime: scheduleNow ? undefined : scheduledTime,
      createdDate: new Date().toISOString().split('T')[0],
      impressions: 0
    };

    setAnnouncements([newItem, ...announcements]);
    setIsModalOpen(false);
    setTitle('');
    setMessage('');
    showToast(`Broadcast "${title}" published successfully!`);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast('Announcement deleted.');
  };

  const toggleStatus = (id: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const next = a.status === 'Active' ? 'Ended' : 'Active';
        return { ...a, status: next };
      }
      return a;
    }));
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

      {/* Control Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <span>Announcement Center & System Broadcasts</span>
          </h2>
          <p className="text-xs text-app-sec">Push live platform updates, maintenance banners, and targeted market notifications.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Broadcast</span>
        </button>
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((item) => (
          <div key={item.id} className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-3 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  item.category === 'Maintenance Notices' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  item.category === 'Security Alerts' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {item.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Active' ? 'bg-emerald-500 text-white' :
                    item.status === 'Scheduled' ? 'bg-amber-500 text-white' : 'bg-app-sec text-app-sec'
                  }`}>
                    {item.status}
                  </span>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-app-sec hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-app">{item.title}</h3>
              <p className="text-xs text-app-sec leading-relaxed">{item.message}</p>
            </div>

            <div className="pt-3 border-t border-app flex items-center justify-between text-[11px] text-app-sec font-mono">
              <div>Audience: <strong className="text-app">{item.targetAudience}</strong></div>
              <div>Impressions: <strong className="text-amber-500">{item.impressions.toLocaleString()}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-500" />
                <span>Publish New System Announcement</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-app-sec mb-1">Broadcast Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance or Market Listing"
                  required
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                  >
                    <option value="Maintenance Notices">Maintenance Notices</option>
                    <option value="Market Alerts">Market Alerts</option>
                    <option value="Promotions">Promotions</option>
                    <option value="Platform Updates">Platform Updates</option>
                    <option value="Security Alerts">Security Alerts</option>
                    <option value="Push Notifications">Push Notifications</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Live Accounts">Live Accounts Only</option>
                    <option value="Demo Accounts">Demo Accounts Only</option>
                    <option value="VIP Members">VIP Tier Members</option>
                    <option value="Lead Traders">Lead Traders Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-app-sec mb-1">Broadcast Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type full announcement copy..."
                  rows={4}
                  required
                  className="w-full bg-app-sec border border-app rounded-xl p-3 text-xs text-app focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app">Broadcast Timing</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={scheduleNow} onChange={() => setScheduleNow(true)} />
                      <span className="font-bold text-app">Publish Now</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={!scheduleNow} onChange={() => setScheduleNow(false)} />
                      <span className="font-bold text-app">Schedule</span>
                    </label>
                  </div>
                </div>

                {!scheduleNow && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="bg-app-card border border-app rounded-xl px-3 py-2 text-xs text-app"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-app-card border border-app rounded-xl px-3 py-2 text-xs text-app"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
