import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ChevronRight, 
  Sparkles, 
  X, 
  Menu,
  Check,
  Sun,
  Moon,
  ShieldCheck,
  Smartphone,
  HelpCircle,
  MessageSquare,
  Star,
  Zap,
  TrendingUp,
  Info,
  Home,
  UserPlus,
  LogIn,
  Palette
} from 'lucide-react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { NavigationTab } from '../../types';
import { AuthModal } from '../modals/AuthModal';
import { ThemeSettingsModal } from '../modals/ThemeSettingsModal';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'JP', name: '日本語' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const { mode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedLang, setSelectedLang] = useState('EN');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useOverlayRegistration('header-slideout-menu', isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const desktopNavLinks: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'markets', label: 'Markets' },
    { id: 'features', label: 'Platform Features' },
    { id: 'security', label: 'Security' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'download', label: 'Download App' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Support' },
  ];

  const menuItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'features', label: 'Platform Features', icon: Zap },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'download', label: 'Download App', icon: Smartphone },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Support', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: MessageSquare },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-40 h-16 transition-all duration-300 backdrop-blur-md ${
          isScrolled 
            ? 'bg-app-card/90 dark:bg-app-card/95 border-b border-app/60 shadow-md' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* LEFT SIDE: ORIVIANT Logo & Wordmark */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer shrink-0"
            aria-label="ORIVIANT Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-400">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-app">ORIVIANT</span>
          </button>

          {/* CENTER: DESKTOP NAVIGATION LINKS (Visible on lg >= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {desktopNavLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'download') {
                      window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install';
                    } else {
                      onNavigate(link.id);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-app-sec hover:text-app hover:bg-app-sec/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE: Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* 1. Language/Country Selector Icon (Globe - Always Visible) */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="w-10 h-10 rounded-xl bg-app-card hover:bg-app-sec text-app font-bold text-xs border border-app transition-colors flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                title="Select Language"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4 text-cyan-500" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-app-card border border-app rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        selectedLang === lang.code ? 'bg-blue-600/20 text-blue-500 font-bold' : 'text-app-sec hover:bg-app-sec'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {selectedLang === lang.code && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. DESKTOP ONLY: Log In & Create Account Buttons */}
            <button
              onClick={() => openAuth('login')}
              className="hidden lg:flex items-center justify-center px-4 py-2 rounded-xl bg-app-card hover:bg-app-sec text-app font-extrabold text-xs border border-app transition-all cursor-pointer shadow-sm"
            >
              Log In
            </button>

            <button
              onClick={() => openAuth('signup')}
              className="hidden lg:flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20"
            >
              Create Account
            </button>

            {/* 4. TABLET & MOBILE ONLY: Menu (Hamburger) Icon */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-app-card hover:bg-app-sec text-app border border-app transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

        </div>
      </header>

      {/* PREMIUM SLIDE-OUT NAVIGATION DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Slide-out Menu Container */}
          <div 
            className="relative w-[85vw] sm:w-[380px] bg-app-card border-l border-app h-full shadow-2xl flex flex-col z-10 overflow-y-auto transition-all duration-300 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-app flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <span className="font-black text-base text-app tracking-tight">ORIVIANT</span>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Login & Create Account Buttons (Menu Only) */}
            <div className="p-5 border-b border-app space-y-2.5 bg-app-sec/40">
              <button
                onClick={() => openAuth('signup')}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
              
              <button
                onClick={() => openAuth('login')}
                className="w-full py-3 px-4 rounded-2xl bg-app-card hover:bg-app text-app font-extrabold text-xs border border-app transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-500" />
                <span>Log In</span>
              </button>
            </div>

            {/* Menu Links */}
            <div className="p-4 space-y-1 text-xs flex-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-app-sec">
                Navigation
              </div>

              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      if (item.id === 'download') {
                        window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install';
                      } else {
                        onNavigate(item.id);
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600/15 text-blue-500 border border-blue-500/30' 
                        : 'text-app-sec hover:text-app hover:bg-app-sec'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-app-sec'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                );
              })}
            </div>

            {/* Custom Theme Settings Footer Option */}
            <div className="p-4 border-t border-app bg-app-sec/40">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsThemeModalOpen(true);
                }}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-app-card hover:bg-app text-app-sec hover:text-app border border-app font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-500" />
                  <span>Appearance Customizer</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onNavigate={onNavigate}
      />

      {/* Theme Settings Modal */}
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
};