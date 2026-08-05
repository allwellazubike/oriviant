import React from 'react';
import { Menu, Sun, Moon, Shield, Search, Activity, User, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onLogout
}) => {
  const { mode, toggleTheme } = useTheme();

  const titleMap: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: 'Real-time platform metrics, volume & user growth' },
    users: { title: 'User Management Suite', subtitle: 'Search, audit, suspend & manage user balances' },
    markets: { title: 'Market & Pair Controls', subtitle: 'Configure spot/futures pairs, fees & availability' },
    'market-feeds': { title: 'Real-Time Market Feeds', subtitle: 'Live pricing providers, status & WebSocket controls' },
    practice: { title: 'Practice Mode & Simulator Desk', subtitle: 'Manage virtual balances, reset accounts & monitor leaderboard' },
    'copy-trading': { title: 'Lead Traders Desk', subtitle: 'Review applications, manage rankings & copiers' },
    deposits: { title: 'Crypto & Fiat Deposits Inflows', subtitle: 'Review deposit requests, proofs & TX hashes' },
    withdrawals: { title: 'Withdrawal Approvals Desk', subtitle: 'Compliance review & automated withdrawal signatures' },
    reviews: { title: 'Reviews Moderation', subtitle: 'Approve, feature or remove platform feedback' },
    academy: { title: 'Academy & Content Hub', subtitle: 'Manage courses, tutorials & weekly challenges' },
    announcements: { title: 'Announcements & News Desk', subtitle: 'Publish breaking updates, news & banners' },
    promotions: { title: 'Promotions & Deposit Bonuses', subtitle: 'Configure user vouchers, referral bonuses & promos' },
    analytics: { title: 'Analytics & Traffic', subtitle: 'User trajectory, device statistics & revenue' },
    notifications: { title: 'Broadcast Alerts', subtitle: 'Dispatch platform banners, maintenance & alerts' },
    reports: { title: 'Reports & Data Export', subtitle: 'Generate compliance exports in CSV, Excel or PDF' },
    settings: { title: 'Platform Configuration', subtitle: 'Branding, email gateway & maintenance toggles' },
    security: { title: 'Security Center', subtitle: 'Audit logs, admin sessions & threat monitoring' },
    'system-logs': { title: 'System Event Stream', subtitle: 'Live API logs, heartbeats & execution traces' },
    'audit-log': { title: 'Executive Audit Trail', subtitle: 'Immutable administrative action & state ledger' },
  };

  const currentInfo = titleMap[activeTab] || { title: 'Admin Portal', subtitle: 'Platform Administration' };

  return (
    <header className="sticky top-0 z-30 bg-app-card border-b border-app px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-app-sec text-app hover:bg-app-sec/80 transition-colors"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-black text-app leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-[11px] text-app-sec hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* System Health Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Operational (99.99%)</span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-app-sec text-app hover:bg-app-sec/80 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Admin User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-app">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-app block leading-none">Owner Admin</span>
            <span className="text-[10px] text-app-sec block mt-0.5">admin@oriviant.io</span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
