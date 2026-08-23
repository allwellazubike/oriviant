import React, { useState, useEffect } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { AdminLoginForm } from '../admin/AdminLoginForm';
import { AdminSidebar, AdminTab } from '../admin/AdminSidebar';
import { AdminHeader } from '../admin/AdminHeader';

import { AdminDashboardTab } from '../admin/tabs/AdminDashboardTab';
import { AdminUsersTab } from '../admin/tabs/AdminUsersTab';
import { AdminMarketsTab } from '../admin/tabs/AdminMarketsTab';
import { MarketFeedsManagementView } from '../admin/MarketFeedsManagementView';
import { AdminPracticeTab } from '../admin/tabs/AdminPracticeTab';
import { AdminCopyTradingTab } from '../admin/tabs/AdminCopyTradingTab';
import { AdminDepositsTab } from '../admin/tabs/AdminDepositsTab';
import { AdminWithdrawalsTab } from '../admin/tabs/AdminWithdrawalsTab';
import { AdminReviewsTab } from '../admin/tabs/AdminReviewsTab';
import { AdminAcademyTab } from '../admin/tabs/AdminAcademyTab';
import { AdminAnnouncementsTab } from '../admin/tabs/AdminAnnouncementsTab';
import { AdminPromotionsTab } from '../admin/tabs/AdminPromotionsTab';
import { AdminAnalyticsTab } from '../admin/tabs/AdminAnalyticsTab';
import { AdminNotificationsTab } from '../admin/tabs/AdminNotificationsTab';
import { AdminReportsTab } from '../admin/tabs/AdminReportsTab';
import { AdminSettingsTab } from '../admin/tabs/AdminSettingsTab';
import { AdminSecurityTab } from '../admin/tabs/AdminSecurityTab';
import { AdminSystemLogsTab } from '../admin/tabs/AdminSystemLogsTab';
import { AdminAuditLogTab } from '../admin/tabs/AdminAuditLogTab';

interface AdminPortalViewProps {
  onExitToPlatform?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onExitToPlatform }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('oriviant_admin_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed.authenticated);
      }
    } catch {
      // ignore parsing errors
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useOverlayRegistration('admin-mobile-menu', isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  const handleLogout = () => {
    localStorage.removeItem('oriviant_admin_auth');
    setIsAuthenticated(false);
  };

  const handleExit = () => {
    if (onExitToPlatform) {
      onExitToPlatform();
    } else {
      window.location.hash = '#home';
    }
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onLoginSuccess={() => setIsAuthenticated(true)}
        onExitToPlatform={handleExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-app text-app flex flex-col md:flex-row -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        onExitToPlatform={handleExit}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <AdminHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <AdminDashboardTab />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'markets' && <AdminMarketsTab />}
          {activeTab === 'market-feeds' && <MarketFeedsManagementView />}
          {activeTab === 'practice' && <AdminPracticeTab />}
          {activeTab === 'copy-trading' && <AdminCopyTradingTab />}
          {activeTab === 'deposits' && <AdminDepositsTab />}
          {activeTab === 'withdrawals' && <AdminWithdrawalsTab />}
          {activeTab === 'reviews' && <AdminReviewsTab />}
          {activeTab === 'academy' && <AdminAcademyTab />}
          {activeTab === 'announcements' && <AdminAnnouncementsTab />}
          {activeTab === 'promotions' && <AdminPromotionsTab />}
          {activeTab === 'analytics' && <AdminAnalyticsTab />}
          {activeTab === 'notifications' && <AdminNotificationsTab />}
          {activeTab === 'reports' && <AdminReportsTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
          {activeTab === 'security' && <AdminSecurityTab />}
          {activeTab === 'system-logs' && <AdminSystemLogsTab />}
          {activeTab === 'audit-log' && <AdminAuditLogTab />}
        </main>

      </div>

    </div>
  );
};