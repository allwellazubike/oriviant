import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { TradingProvider } from './contexts/TradingContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { CopyTradingProvider } from './contexts/CopyTradingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { useTrading } from './contexts/TradingContext';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { SignOutModal } from './components/auth/SignOutModal';
import { DemoWelcomeModal } from './components/layout/DemoWelcomeModal';

import { WelcomeView } from './components/views/WelcomeView';
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
  const { isLoggedIn, openAuthModal } = useUser();
  const { activeTab, activeSymbol, navigate } = useNavigation();
  const { setActiveCoinSymbol } = useTrading();

  // Sync active symbol with TradingContext when navigated
  useEffect(() => {
    if (activeSymbol) {
      setActiveCoinSymbol(activeSymbol);
    }
  }, [activeSymbol, setActiveCoinSymbol]);

  // Protected tabs list
  const protectedTabs: NavigationTab[] = [
    'home',
    'markets',
    'spot',
    'futures',
    'assets',
    'copy-trading',
    'demo-workspace',
    'practice-mode',
    'profile',
    'settings',
    'admin'
  ];

  // Enforce redirection to Welcome screen if not logged in
  useEffect(() => {
    if (!isLoggedIn && protectedTabs.includes(activeTab)) {
      navigate('welcome', { replace: true });
    }
  }, [isLoggedIn, activeTab, navigate]);

  // Listen for custom logout events for instantaneous UI reaction
  useEffect(() => {
    const handleLogout = () => {
      navigate('welcome', { replace: true });
    };
    window.addEventListener('oriviant_session_logout', handleLogout);
    return () => window.removeEventListener('oriviant_session_logout', handleLogout);
  }, [navigate]);

  // When user logs in, if currently on 'welcome', return directly to Dashboard ('home')
  const prevLoggedInRef = useRef(isLoggedIn);
  useEffect(() => {
    if (!prevLoggedInRef.current && isLoggedIn) {
      if (activeTab === 'welcome') {
        navigate('home', { replace: true });
      }
    }
    prevLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, activeTab, navigate]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        if (isLoggedIn) {
          navigate('admin');
        } else {
          openAuthModal('login');
          navigate('welcome');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn, openAuthModal, navigate]);

  const handleNavigate = (tab: NavigationTab, options?: { subTab?: string; symbol?: string }) => {
    if (!isLoggedIn && protectedTabs.includes(tab)) {
      openAuthModal('login');
      navigate('welcome');
      return;
    }

    navigate(tab, options);
    if (tab !== 'admin' && window.location.hash === '#admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) { /* ignore */ }
    }
  };

  const isStandaloneAdmin = activeTab === 'admin';

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-200 flex flex-col font-sans selection:bg-accent selection:text-white pb-20 md:pb-6">
      {/* Global Top Header (Hidden if in standalone Admin view) */}
      {!isStandaloneAdmin && <Header activeTab={activeTab} onNavigate={handleNavigate} />}

      {/* Main Container */}
      <main className={isStandaloneAdmin ? "flex-1 w-full" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"}>
        {activeTab === 'welcome' && <WelcomeView onNavigate={handleNavigate} />}
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
      {!isStandaloneAdmin && <SignOutModal />}
      {!isStandaloneAdmin && <DemoWelcomeModal />}

      {/* Mobile Sticky Bottom Navigation (Hidden in Admin Mode or Welcome View) */}
      {!isStandaloneAdmin && activeTab !== 'welcome' && <BottomNav activeTab={activeTab} onNavigate={handleNavigate} />}
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
                  <NavigationProvider>
                    <AppContent />
                  </NavigationProvider>
                </SearchProvider>
              </NotificationProvider>
            </CopyTradingProvider>
          </UserProvider>
        </TradingProvider>
      </DemoModeProvider>
    </ThemeProvider>
  );
}
