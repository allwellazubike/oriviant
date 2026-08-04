import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { TradingProvider } from './contexts/TradingContext';
import { UserProvider } from './contexts/UserContext';
import { CopyTradingProvider } from './contexts/CopyTradingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { DemoWelcomeModal } from './components/layout/DemoWelcomeModal';

import { HomeView } from './components/views/HomeView';
import { MarketsView } from './components/views/MarketsView';
import { SpotTradingView } from './components/views/SpotTradingView';
import { FuturesTradingView } from './components/views/FuturesTradingView';
import { DemoWorkspaceView } from './components/views/DemoWorkspaceView';
import { CopyTradingView } from './components/views/CopyTradingView';
import { AssetsView } from './components/views/AssetsView';
import { AcademyView } from './components/views/AcademyView';
import { ReferralView } from './components/views/ReferralView';
import { HelpCenterView } from './components/views/HelpCenterView';
import { ReviewsView } from './components/views/ReviewsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { AdminPortalView } from './components/views/AdminPortalView';

import { NavigationTab } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'home';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (tab !== 'admin' && window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStandaloneAdmin = activeTab === 'admin';

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200 flex flex-col font-sans selection:bg-accent selection:text-white pb-20 md:pb-6">
      {/* Global Top Header (Hidden if in standalone Admin view to preserve complete privacy & separation) */}
      {!isStandaloneAdmin && <Header activeTab={activeTab} onNavigate={handleNavigate} />}

      {/* Main Container */}
      <main className={isStandaloneAdmin ? "flex-1 w-full" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"}>
        {activeTab === 'home' && <HomeView onNavigate={handleNavigate} />}
        {activeTab === 'markets' && <MarketsView onNavigate={handleNavigate} />}
        {activeTab === 'spot' && <SpotTradingView />}
        {activeTab === 'futures' && <FuturesTradingView />}
        {activeTab === 'demo-workspace' && <DemoWorkspaceView onNavigate={handleNavigate} />}
        {activeTab === 'copy-trading' && <CopyTradingView />}
        {activeTab === 'assets' && <AssetsView />}
        {activeTab === 'academy' && <AcademyView />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'referral' && <ReferralView />}
        {activeTab === 'help' && <HelpCenterView />}
        {(activeTab === 'profile' || activeTab === 'settings') && (
          <ProfileSettingsView onNavigate={handleNavigate} />
        )}
        {activeTab === 'admin' && <AdminPortalView onExitToPlatform={() => handleNavigate('home')} />}
      </main>

      {/* Global Modals & Overlays */}
      {!isStandaloneAdmin && <NotificationDrawer onNavigate={handleNavigate} />}
      {!isStandaloneAdmin && <GlobalSearchModal onNavigate={handleNavigate} />}
      {!isStandaloneAdmin && <AuthModal />}
      {!isStandaloneAdmin && <DemoWelcomeModal />}

      {/* Mobile Sticky Bottom Navigation (Hidden in Admin Mode) */}
      {!isStandaloneAdmin && <BottomNav activeTab={activeTab} onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DemoModeProvider>
        <TradingProvider>
          <UserProvider>
            <CopyTradingProvider>
              <NotificationProvider>
                <SearchProvider>
                  <AppContent />
                </SearchProvider>
              </NotificationProvider>
            </CopyTradingProvider>
          </UserProvider>
        </TradingProvider>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
