import React, { useState, useEffect } from 'react';
import { AdminLoginForm } from '../admin/AdminLoginForm';
import { AdminSidebar, AdminTab } from '../admin/AdminSidebar';
import { AdminHeader } from '../admin/AdminHeader';

import { AdminDashboardTab } from '../admin/tabs/AdminDashboardTab';
import { AdminUsersTab } from '../admin/tabs/AdminUsersTab';
import { AdminMarketsTab } from '../admin/tabs/AdminMarketsTab';
import { AdminCopyTradingTab } from '../admin/tabs/AdminCopyTradingTab';
import { AdminReviewsTab } from '../admin/tabs/AdminReviewsTab';
import { AdminAcademyTab } from '../admin/tabs/AdminAcademyTab';
import { AdminAnalyticsTab } from '../admin/tabs/AdminAnalyticsTab';
import { AdminNotificationsTab } from '../admin/tabs/AdminNotificationsTab';
import { AdminSettingsTab } from '../admin/tabs/AdminSettingsTab';
import { AdminSecurityTab } from '../admin/tabs/AdminSecurityTab';
import { AdminSystemLogsTab } from '../admin/tabs/AdminSystemLogsTab';

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
          {activeTab === 'copy-trading' && <AdminCopyTradingTab />}
          {activeTab === 'reviews' && <AdminReviewsTab />}
          {activeTab === 'academy' && <AdminAcademyTab />}
          {activeTab === 'analytics' && <AdminAnalyticsTab />}
          {activeTab === 'notifications' && <AdminNotificationsTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
          {activeTab === 'security' && <AdminSecurityTab />}
          {activeTab === 'system-logs' && <AdminSystemLogsTab />}
        </main>

      </div>

    </div>
  );
};
