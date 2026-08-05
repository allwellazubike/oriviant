import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  Zap, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Award, 
  RefreshCw,
  Sparkles,
  Lock,
  Menu,
  X,
  Home,
  TrendingUp,
  Layers,
  Users,
  Wallet,
  Gift,
  BookOpen,
  Smartphone,
  ChevronRight,
  Star,
  CheckCircle2,
  Shield,
  FileText
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../contexts/UserContext';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { NavigationTab } from '../../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const { mode, toggleTheme } = useTheme();
  const { isDemoMode, toggleDemoMode, demoBalance, refillDemoFunds } = useDemoMode();
  const { unreadCount, openDrawer } = useNotifications();
  const { openSearch } = useSearch();
  const { user, isLoggedIn, logout, openAuthModal } = useUser();

  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useOverlayRegistration('header-mobile-menu', isMobileMenuOpen, () => setIsMobileMenuOpen(false));
  useOverlayRegistration('header-account-drawer', isAccountDrawerOpen, () => setIsAccountDrawerOpen(false));

  // Close drawers when activeTab changes or esc key pressed
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountDrawerOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsAccountDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMobileNavigate = (tab: NavigationTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    setIsAccountDrawerOpen(false);
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      openAuthModal('login');
    } else {
      setIsAccountDrawerOpen(!isAccountDrawerOpen);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-app-card border-b border-app backdrop-blur-md transition-colors duration-200">
        
        {!isLoggedIn ? (
          /* ========================================== */
          /* GUEST MODE HEADER (DESKTOP & MOBILE)       */
          /* ========================================== */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            {/* Guest Logo */}
            <button 
              onClick={() => onNavigate('welcome')}
              className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-app-card rounded-[10px] flex items-center justify-center font-bold text-xl text-accent">
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-app">ORIVIANT</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-app-sec font-medium tracking-wide hidden sm:block">TRADE • INVEST • GROW</p>
              </div>
            </button>

            {/* Guest Actions (Theme toggle on far right) */}
            <div className="flex items-center">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors border border-app min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle Theme"
              >
                {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>

          </div>
        ) : (
          <>
            {/* ========================================== */}
            {/* DESKTOP HEADER (MD & UP)                   */}
            {/* ========================================== */}
            <div className="hidden md:flex max-w-7xl mx-auto px-6 lg:px-8 h-16 items-center justify-between gap-4">
              
              {/* Desktop Left: Logo & Nav */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <div className="w-full h-full bg-app-card rounded-[10px] flex items-center justify-center font-bold text-xl text-accent">
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-xl tracking-tight text-app">ORIVIANT</span>
                    </div>
                    <p className="text-[10px] text-app-sec font-medium tracking-wide">TRADE • INVEST • GROW</p>
                  </div>
                </button>

                {/* Desktop Navigation Links */}
                <nav className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => onNavigate('home')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'home' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => onNavigate('markets')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'markets' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Markets
                  </button>
                  <button
                    onClick={() => onNavigate('spot')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'spot' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Spot
                  </button>
                  <button
                    onClick={() => onNavigate('futures')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'futures' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Futures
                    <span className="px-1 text-[9px] bg-red-500/15 text-red-500 rounded font-bold">125x</span>
                  </button>
                  <button
                    onClick={() => onNavigate('copy-trading')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'copy-trading' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Copy Trading
                  </button>
                  <button
                    onClick={() => onNavigate('academy')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'academy' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Academy
                  </button>
                  <button
                    onClick={() => onNavigate('reviews')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      activeTab === 'reviews' ? 'bg-app-sec text-accent font-semibold' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    Reviews
                  </button>
                  <button
                    onClick={() => onNavigate('demo-workspace')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'demo-workspace' || activeTab === 'practice-mode' ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20' : 'text-app-sec hover:text-app hover:bg-app-sec/50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Practice Demo Mode</span>
                  </button>
                </nav>
              </div>

              {/* Desktop Right: Search, Notifs, Theme, Profile */}
              <div className="flex items-center gap-3">

                {/* Global Search Button */}
                <button
                  onClick={openSearch}
                  className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors border border-app flex items-center gap-2 cursor-pointer"
                  title="Search markets, coins, traders (Ctrl+K)"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs font-medium text-app-sec">Search...</span>
                </button>

                {/* Notifications Trigger */}
                <button
                  onClick={openDrawer}
                  className="relative p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors border border-app min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors border border-app min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
                  title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>

                {/* Profile Avatar Button (Toggles Right-Side Account Drawer) */}
                <button
                  onClick={() => setIsAccountDrawerOpen(!isAccountDrawerOpen)}
                  className="p-1 rounded-xl bg-app-sec hover:bg-app-sec/80 border border-app transition-all focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 group cursor-pointer"
                  title="Account Profile & Settings"
                  aria-label="User Account Profile"
                >
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-7 h-7 rounded-lg object-cover ring-2 ring-accent/30 group-hover:ring-accent transition-all shrink-0"
                  />
                </button>

              </div>
            </div>

            {/* ========================================== */}
            {/* MOBILE TOP HEADER ROW (< MD)                */}
            {/* LEFT: Logo ONLY                            */}
            {/* RIGHT ORDER: Search | Notification | Theme | Profile | Hamburger */}
            {/* ========================================== */}
            <div className="flex md:hidden h-14 px-3 items-center justify-between gap-1.5 border-b border-app/60">
              
              {/* LEFT: Oriviant Logo ONLY */}
              <div className="flex items-center shrink-0">
                <button 
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-1.5 group text-left focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
                    <div className="w-full h-full bg-app-card rounded-[8px] flex items-center justify-center font-bold text-accent">
                      <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                    </div>
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-app">ORIVIANT</span>
                </button>
              </div>

              {/* RIGHT: Search -> Notification -> Theme Toggle -> Profile -> Hamburger */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                
                {/* 1. Search Icon */}
                <button
                  onClick={openSearch}
                  className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app border border-app min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Search"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* 2. Notification Bell */}
                <button
                  onClick={openDrawer}
                  className="relative p-2 rounded-xl bg-app-sec text-app-sec hover:text-app border border-app min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 3. Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app border border-app min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
                  aria-label="Toggle Theme"
                >
                  {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>

                {/* 4. Profile Avatar */}
                <button
                  onClick={handleProfileClick}
                  className="p-0.5 rounded-xl bg-app-sec hover:bg-app-sec/80 border border-app shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Profile & Account"
                  aria-label="User Account Profile"
                >
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-accent/30"
                  />
                </button>

                {/* 5. Hamburger Menu (Far Right Edge) */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl bg-app-sec text-app hover:text-accent border border-app transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label="Open Mobile Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>

              </div>

            </div>
          </>
        )}

      </header>

      {/* ========================================================= */}
      {/* RIGHT-SIDE ACCOUNT DRAWER (DESKTOP & MOBILE)               */}
      {/* Width: 440px on Desktop, Viewport Height, Slide from Right  */}
      {/* ========================================================= */}
      {isAccountDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dimmed Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAccountDrawerOpen(false)}
          />

          {/* Slide-in Right Panel */}
          <div 
            className="relative w-full sm:w-[440px] h-full bg-app-card border-l border-app shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-250 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-app flex items-center justify-between shrink-0 bg-app-card">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-extrabold text-app tracking-tight uppercase">Account Management</h2>
              </div>
              <button
                onClick={() => setIsAccountDrawerOpen(false)}
                className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors"
                aria-label="Close Account Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-app">
              
              {/* Profile Main Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-app-sec/50 to-app-sec/20 border border-app shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.avatar} 
                    alt={user.nickname} 
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-accent/30 shadow-md shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-app truncate">
                      {user.nickname}
                    </h3>
                    <p className="text-xs text-app-sec font-medium truncate mt-0.5">
                      @{user.nickname.toLowerCase().replace(/\s+/g, '_')}
                    </p>
                    <p className="text-xs text-app-sec truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Badges and Meta Information Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-app/60 text-xs">
                  <div className="p-2.5 rounded-xl bg-app-card/60 border border-app/60 space-y-1">
                    <span className="text-[10px] text-app-sec font-bold uppercase tracking-wider block">Account UID</span>
                    <span className="font-mono font-bold text-app text-xs">{user.id}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-app-card/60 border border-app/60 space-y-1">
                    <span className="text-[10px] text-app-sec font-bold uppercase tracking-wider block">VIP Level</span>
                    <span className="font-bold text-accent text-xs">VIP Level {user.vipLevel}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-app-card/60 border border-app/60 space-y-1">
                    <span className="text-[10px] text-app-sec font-bold uppercase tracking-wider block">Verification</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-500 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      KYC Level 2
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-app-card/60 border border-app/60 space-y-1">
                    <span className="text-[10px] text-app-sec font-bold uppercase tracking-wider block">Security Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-400 text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      2FA Active
                    </span>
                  </div>
                </div>

                {/* Status Banner & Theme Preference */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-emerald-500">Account Verification: Verified</span>
                  </div>
                  <span className="text-[10px] text-app-sec font-medium">Daily Limit: $1,000,000</span>
                </div>

                <div className="p-2.5 rounded-xl bg-app-card/60 border border-app/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-app-sec font-bold uppercase tracking-wider block">Theme Preference</span>
                    <span className="font-bold text-app text-xs capitalize">{mode} Mode Active</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-app-sec hover:bg-app text-app border border-app transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {mode === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                    <span>Toggle Theme</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions / Navigation Shortcuts */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-app-sec uppercase tracking-wider px-1">
                  Quick Actions
                </span>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/10 text-accent">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">My Profile</p>
                      <p className="text-[10px] text-app-sec">Manage profile & identity details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('assets');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Assets</p>
                      <p className="text-[10px] text-app-sec">Balances, deposit & withdrawal</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('spot');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Orders</p>
                      <p className="text-[10px] text-app-sec">Active trades & order history</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('copy-trading');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Copy Trading</p>
                      <p className="text-[10px] text-app-sec">Lead traders & copied portfolios</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Settings</p>
                      <p className="text-[10px] text-app-sec">Platform & account configuration</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Security</p>
                      <p className="text-[10px] text-app-sec">2FA, passwords & API keys</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    openDrawer();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Notifications</p>
                      <p className="text-[10px] text-app-sec">Price alerts & activity updates</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('referral');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Referral Program (Earn 40%)</p>
                      <p className="text-[10px] text-app-sec">Invite friends & track commission</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>

                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    onNavigate('help');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-sec/40 border border-app hover:bg-app-sec transition-colors text-app text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Help Center & Support</p>
                      <p className="text-[10px] text-app-sec">24/7 support & platform guides</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec" />
                </button>
              </div>

            </div>

            {/* Drawer Footer with Logout and Admin Portal (Positioned immediately ABOVE Sign Out) */}
            <div className="p-4 border-t border-app bg-app-card shrink-0 space-y-2.5">
              
              {/* Admin Portal Option - Positioned IMMEDIATELY ABOVE Sign Out */}
              <button
                onClick={() => {
                  setIsAccountDrawerOpen(false);
                  onNavigate('admin');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-500 font-extrabold text-xs transition-all shadow-sm group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 group-hover:scale-105 transition-transform">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <span>🛡️ Admin Portal</span>
                    </p>
                    <p className="text-[10px] text-amber-500/80 font-medium">Restricted administrator access</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500/70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Sign Out Option */}
              <button
                onClick={() => {
                  setIsAccountDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Oriviant Account</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HAMBURGER SLIDE-OUT DRAWER FOR MOBILE (NAVIGATION DRAWER) */}
      {/* SLIDES IN FROM RIGHT EDGE WITH ~90% (max 380px) WIDTH     */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          
          {/* Dimmed Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel - ANCHORED TO RIGHT SIDE */}
          <div 
            className="relative w-[90vw] max-w-[380px] bg-app-card border-l border-app h-full shadow-2xl flex flex-col z-10 overflow-y-auto overscroll-contain animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Drawer Top Header / User Profile Section */}
            <div className="p-4 border-b border-app bg-app-sec/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5">
                    <div className="w-full h-full bg-app-card rounded-[9px] flex items-center justify-center font-bold text-accent text-sm">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-app">ORIVIANT</span>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Bar in Drawer Header */}
              {isLoggedIn ? (
                <div className="p-3 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={user.avatar} 
                      alt={user.nickname} 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-accent/30" 
                    />
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-app truncate">{user.nickname}</span>
                        <span className="px-1 py-0.2 text-[9px] bg-emerald-500/15 text-emerald-500 font-bold rounded shrink-0">
                          KYC L2
                        </span>
                      </div>
                      <p className="text-[10px] text-app-sec truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-app text-app-sec">
                    <span>UID: {user.id}</span>
                    <span className="font-bold text-accent">VIP {user.vipLevel}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-app-card border border-app shadow-sm space-y-2">
                  <p className="text-xs font-semibold text-app">Welcome to Oriviant Exchange</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="flex-1 py-2 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('register');
                      }}
                      className="flex-1 py-2 rounded-xl bg-app-sec text-app font-bold text-xs border border-app"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Categorized Navigation List */}
            <div className="flex-1 p-3 space-y-4 text-xs">
              
              {/* CATEGORY 1: TRADING & MARKETS */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-app-sec uppercase tracking-wider">
                  TRADING & MARKETS
                </div>

                <button
                  onClick={() => handleMobileNavigate('home')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'home' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-blue-500" />
                    <span>Home Overview</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('markets')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'markets' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span>Markets Overview</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('spot')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'spot' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Spot Trading</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('futures')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'futures' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-red-500" />
                    <span>Futures Trading</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-500/15 text-red-500 rounded">
                    125x
                  </span>
                </button>

                <button
                  onClick={() => handleMobileNavigate('copy-trading')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'copy-trading' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Copy Trading</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-500/15 text-emerald-500 rounded uppercase">
                    PRO
                  </span>
                </button>

                <button
                  onClick={() => handleMobileNavigate('assets')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'assets' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>Assets & Wallets</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('demo-workspace')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'demo-workspace' || activeTab === 'practice-mode' ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Practice Demo Mode</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-500 rounded">
                    10,000 USDT
                  </span>
                </button>
              </div>

              {/* CATEGORY 2: REWARDS & GROWTH */}
              <div className="space-y-1 pt-2 border-t border-app">
                <div className="px-3 py-1 text-[10px] font-bold text-app-sec uppercase tracking-wider">
                  REWARDS & EDUCATION
                </div>

                <button
                  onClick={() => handleMobileNavigate('referral')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'referral' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span>Referral Hub & Rewards</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-500 rounded">
                    Earn 40%
                  </span>
                </button>

                <button
                  onClick={() => handleMobileNavigate('academy')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'academy' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>Crypto Academy & Guides</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('reviews')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'reviews' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Platform Reviews & Ratings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>
              </div>

              {/* CATEGORY 4: ACCOUNT & SUPPORT */}
              <div className="space-y-1 pt-2 border-t border-app">
                <div className="px-3 py-1 text-[10px] font-bold text-app-sec uppercase tracking-wider">
                  ACCOUNT & SUPPORT
                </div>

                <button
                  onClick={() => handleMobileNavigate('profile')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'profile' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-app-sec" />
                    <span>User Profile & Verification</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('settings')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'settings' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-app-sec" />
                    <span>Security & Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('help')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                    activeTab === 'help' ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-app hover:bg-app-sec'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-app-sec" />
                    <span>Help Center & FAQ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-app-sec opacity-60" />
                </button>

                <button
                  onClick={() => handleMobileNavigate('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors min-h-[44px] ${
                    activeTab === 'admin' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4" />
                    <span>Admin Control Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-colors min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>

            </div>

            {/* Footer info in Drawer */}
            <div className="p-4 border-t border-app bg-app-sec/20 text-center text-[10px] text-app-sec">
              <p className="font-bold text-app">ORIVIANT CRYPTO EXCHANGE</p>
              <p>v2.4.0 • Built for High Performance</p>
            </div>

          </div>
        </div>
      )}

    </>
  );
};
