import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Radio,
  Zap,
  UserCheck, 
  Star, 
  GraduationCap, 
  BarChart3, 
  Bell, 
  Settings, 
  ShieldCheck, 
  FileCode, 
  LogOut, 
  X,
  Lock,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Megaphone,
  Gift,
  FileSpreadsheet,
  ClipboardCheck,
  UserPlus
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'kyc' 
  | 'markets' 
  | 'market-feeds'
  | 'practice'
  | 'copy-trading' 
  | 'lead-traders' // 🔥 Added Lead Traders Tab
  | 'deposits'
  | 'withdrawals'
  | 'reviews' 
  | 'academy' 
  | 'announcements'
  | 'promotions'
  | 'analytics' 
  | 'notifications' 
  | 'reports'
  | 'settings' 
  | 'security' 
  | 'system-logs'
  | 'audit-log';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onExitToPlatform: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  onExitToPlatform
}) => {
  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'User Directory', icon: Users, badge: '142.8k' },
    { id: 'kyc' as AdminTab, label: 'KYC Verification', icon: ClipboardCheck, badge: 'Review' },
    { id: 'markets' as AdminTab, label: 'Market Controls', icon: TrendingUp },
    { id: 'market-feeds' as AdminTab, label: 'Real-Time Market Feeds', icon: Radio, badge: 'Live' },
    { id: 'practice' as AdminTab, label: 'Practice Mode Desk', icon: Zap, badge: 'Simulator' },
    { id: 'copy-trading' as AdminTab, label: 'User Subscriptions', icon: UserCheck },
    { id: 'lead-traders' as AdminTab, label: 'Manage Lead Traders', icon: UserPlus, badge: 'New' }, // 🔥 Added Menu Item
    { id: 'deposits' as AdminTab, label: 'Deposit Inflows', icon: ArrowDownLeft, badge: '3 Req' },
    { id: 'withdrawals' as AdminTab, label: 'Withdrawal Approvals', icon: ArrowUpRight, badge: '5 Pending' },
    { id: 'reviews' as AdminTab, label: 'Reviews Moderation', icon: Star },
    { id: 'academy' as AdminTab, label: 'Academy & Content', icon: GraduationCap },
    { id: 'announcements' as AdminTab, label: 'Announcements', icon: Megaphone },
    { id: 'promotions' as AdminTab, label: 'Promotions & Bonuses', icon: Gift },
    { id: 'analytics' as AdminTab, label: 'Analytics & Traffic', icon: BarChart3 },
    { id: 'notifications' as AdminTab, label: 'Broadcast Banners', icon: Bell },
    { id: 'reports' as AdminTab, label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings' as AdminTab, label: 'Platform Settings', icon: Settings },
    { id: 'security' as AdminTab, label: 'Security Center', icon: ShieldCheck, badge: 'High' },
    { id: 'system-logs' as AdminTab, label: 'System Logs', icon: FileCode },
    { id: 'audit-log' as AdminTab, label: 'Executive Audit Trail', icon: FileCode },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-app-card border-r border-app select-none">
      
      {/* Top Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-app">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-app tracking-tight">ORIVIANT ADMIN</h2>
              <span className="text-[10px] text-amber-500 font-extrabold uppercase">Executive Control</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                    : 'text-app-sec hover:text-app hover:bg-app-sec/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-app-sec'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-app-sec text-app-sec'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-app space-y-2">
        <button
          onClick={onExitToPlatform}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-app-sec hover:text-app hover:bg-app-sec/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-app-sec" />
          <span>Exit to Public Platform</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-full sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 h-full bg-app-card z-10 animate-in slide-in-from-left duration-250">
            {content}
          </div>
        </div>
      )}
    </>
  );
};