import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { TradingProvider } from './contexts/TradingContext';
import { UserProvider } from './contexts/UserContext';
import { CopyTradingProvider } from './contexts/CopyTradingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TickerMarquee } from './components/home/TickerMarquee';
import { StickyAppDownloadBar } from './components/common/StickyAppDownloadBar';
import { GetTheAppPrompt } from './components/common/GetTheAppPrompt';

import { HomeView } from './components/views/HomeView';
import { MarketsView } from './components/views/MarketsView';
import { FeaturesView } from './components/views/FeaturesView';
import { ReviewsView } from './components/views/ReviewsView';
import { AboutView } from './components/views/AboutView';
import { SecurityView } from './components/views/SecurityView';
import { DownloadAppView } from './components/views/DownloadAppView';
import { FaqContactView } from './components/views/FaqContactView';

import { NavigationTab } from './types';
import { triggerApkDownload } from './utils/download';
import { isIos } from './utils/appLinks';

function AppContent() {
  const { activeTab, navigate } = useNavigation();

  const handleNavigate = (tab: NavigationTab) => {
    if (tab === 'download') {
      // Every "Download" link used to fire the APK straight away, which hands
      // an iPhone a file it cannot open. iOS visitors get the download page
      // instead, where the install route for their device is spelled out.
      if (isIos()) {
        navigate('download');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      triggerApkDownload();
      return;
    }
    navigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-300 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Global Website Header */}
      <Header activeTab={activeTab} onNavigate={handleNavigate} />

      {/* Full-Width Live Market Ticker Strip (Toobit Style #1b1f27) */}
      <TickerMarquee onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'home' && <HomeView onNavigate={handleNavigate} />}
        {activeTab === 'markets' && <MarketsView onNavigate={handleNavigate} />}
        {activeTab === 'features' && <FeaturesView onNavigate={handleNavigate} />}
        {activeTab === 'reviews' && <ReviewsView />}
        {activeTab === 'about' && <AboutView onNavigate={handleNavigate} />}
        {activeTab === 'security' && <SecurityView onNavigate={handleNavigate} />}
        {activeTab === 'download' && <DownloadAppView />}
        {activeTab === 'faq' && <FaqContactView onNavigate={handleNavigate} initialTab="faq" />}
        {activeTab === 'contact' && <FaqContactView onNavigate={handleNavigate} initialTab="contact" />}
        
        {/* Privacy Policy Fallback */}
        {activeTab === 'privacy' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-app-card border border-app space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-app">Privacy Policy</h1>
            <p className="text-xs text-app-sec leading-relaxed">
              At ORIVIANT, we are committed to protecting your personal data and upholding institutional privacy standards. This Privacy Policy outlines how we collect, store, and safeguard your credentials.
            </p>
            <div className="space-y-4 text-xs text-app-sec leading-relaxed">
              <h3 className="font-black text-app text-sm">1. Data Encryption</h3>
              <p>All sensitive communications, account parameters, and telemetry data are encrypted in transit using AES-256 and TLS 1.3 protocols.</p>
              <h3 className="font-black text-app text-sm">2. Zero Unauthorized Data Sharing</h3>
              <p>ORIVIANT never sells or rents user data to third-party data brokers. Data is processed solely for account verification, compliance, and risk management.</p>
            </div>
          </div>
        )}

        {/* Terms of Service Fallback */}
        {activeTab === 'terms' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-app-card border border-app space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-app">Terms of Service</h1>
            <p className="text-xs text-app-sec leading-relaxed">
              By accessing or using the ORIVIANT official website or mobile applications, you agree to comply with our global terms of service and risk disclosures.
            </p>
            <div className="space-y-4 text-xs text-app-sec leading-relaxed">
              <h3 className="font-black text-app text-sm">1. Market Volatility Warning</h3>
              <p>Trading in financial markets involves risk. You acknowledge that asset prices can fluctuate rapidly and you are solely responsible for your investment decisions.</p>
              <h3 className="font-black text-app text-sm">2. Mobile Execution Protocol</h3>
              <p>Order placement and position management occur within the official ORIVIANT Mobile Engine to ensure sub-10ms latency and biometric authentication.</p>
            </div>
          </div>
        )}

        {/* Fallback for unknown tabs */}
        {!['home', 'markets', 'features', 'reviews', 'about', 'security', 'download', 'faq', 'contact', 'privacy', 'terms'].includes(activeTab) && (
          <HomeView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Website Footer (Replaces Bottom Mobile Nav everywhere) */}
      <Footer onNavigate={handleNavigate} />

      {/* Fixed Sticky Download Bar at Bottom */}
      <StickyAppDownloadBar onNavigate={handleNavigate} />

      {/* Offers the app to every visitor, once a week per browser */}
      <GetTheAppPrompt />
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

