import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { NavigationTab } from '../types';
import { overlayRegistry } from '../utils/OverlayRegistry';
import { triggerApkDownload } from '../utils/download';
import { Smartphone } from 'lucide-react';

export interface NavigationState {
  tab: NavigationTab;
  subTab?: string;
  symbol?: string;
  scrollY?: number;
}

interface NavigationContextType {
  activeTab: NavigationTab;
  activeSubTab?: string;
  activeSymbol?: string;
  navigate: (tab: NavigationTab, options?: { subTab?: string; symbol?: string; replace?: boolean }) => void;
  goBack: () => void;
  historyLength: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    const auth = localStorage.getItem('oriviant_authenticated');
    if (auth === 'false') return 'welcome';
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'home';
  });

  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  const [activeSymbol, setActiveSymbol] = useState<string | undefined>('BTC/USDT');

  // Internal Navigation History Stack
  const historyStack = useRef<NavigationState[]>([
    {
      tab: activeTab,
      subTab: undefined,
      symbol: 'BTC/USDT',
      scrollY: 0
    }
  ]);

  const [exitToast, setExitToast] = useState<string | null>(null);
  const lastBackPressTime = useRef<number>(0);
  const exitToastTimeout = useRef<any>(null);

  // Synchronize initial browser history entry
  useEffect(() => {
    const initialState = {
      tab: activeTab,
      subTab: undefined,
      symbol: 'BTC/USDT',
      index: 0
    };
    try {
      window.history.replaceState(initialState, '', window.location.pathname + window.location.hash);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const triggerExitToast = (msg: string) => {
    setExitToast(msg);
    if (exitToastTimeout.current) clearTimeout(exitToastTimeout.current);
    exitToastTimeout.current = setTimeout(() => {
      setExitToast(null);
    }, 2000);
  };

  const goBackInternal = useCallback(() => {
    // 1. Check if any modal or drawer overlay is active
    if (overlayRegistry.popAndClose()) {
      // Re-push current state to balance history index
      const cur = historyStack.current[historyStack.current.length - 1];
      if (cur) {
        try {
          window.history.pushState({ ...cur, index: historyStack.current.length - 1 }, '');
        } catch (e) { /* ignore */ }
      }
      return;
    }

    // 2. Check if we have history steps in our internal stack
    if (historyStack.current.length > 1) {
      // Pop current state
      historyStack.current.pop();
      const prev = historyStack.current[historyStack.current.length - 1];

      setActiveTab(prev.tab);
      setActiveSubTab(prev.subTab);
      if (prev.symbol) setActiveSymbol(prev.symbol);

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: prev.scrollY || 0, behavior: 'instant' as ScrollBehavior });
      }, 10);
      return;
    }

    // 3. We are at root screen ('home' or base view)
    const now = Date.now();
    if (now - lastBackPressTime.current < 2000) {
      // User pressed back again within 2s -> Allow app exit / standard browser back
      setExitToast(null);
      window.history.go(-1);
    } else {
      lastBackPressTime.current = now;
      const rootState = historyStack.current[0] || { tab: 'home' };
      try {
        window.history.pushState({ ...rootState, root: true }, '');
      } catch (e) { /* ignore */ }
      triggerExitToast('Press back again to exit ORIVIANT');
    }
  }, []);

  const navigate = useCallback(
    (tab: NavigationTab, options?: { subTab?: string; symbol?: string; replace?: boolean }) => {
      if (tab === 'download') {
        triggerApkDownload();
        return;
      }

      // Save current scroll position
      const top = historyStack.current[historyStack.current.length - 1];
      if (top) {
        top.scrollY = window.scrollY;
      }

      const newState: NavigationState = {
        tab,
        subTab: options?.subTab,
        symbol: options?.symbol || top?.symbol || 'BTC/USDT',
        scrollY: 0
      };

      if (options?.replace) {
        historyStack.current[historyStack.current.length - 1] = newState;
        try {
          window.history.replaceState({ ...newState, index: historyStack.current.length - 1 }, '');
        } catch (e) { /* ignore */ }
      } else {
        historyStack.current.push(newState);
        try {
          window.history.pushState({ ...newState, index: historyStack.current.length - 1 }, '');
        } catch (e) { /* ignore */ }
      }

      setActiveTab(tab);
      setActiveSubTab(options?.subTab);
      if (options?.symbol) {
        setActiveSymbol(options.symbol);
      }

      // Scroll to top for new view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  // Listen for browser popstate (Back button / Android back gesture / Mobile browser swipe)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      goBackInternal();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBackInternal]);

  // Touch edge-swipe back gesture listener for mobile devices
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;

        // Edge swipe from left screen edge (< 35px), dragged rightward > 55px, minimal vertical tilt
        if (startX < 35 && deltaX > 55 && Math.abs(deltaY) < 50) {
          goBackInternal();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goBackInternal]);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        activeSubTab,
        activeSymbol,
        navigate,
        goBack: goBackInternal,
        historyLength: historyStack.current.length
      }}
    >
      {children}

      {/* Exit App Toast Indicator */}
      {exitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-neutral-900/95 text-white border border-white/10 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>{exitToast}</span>
        </div>
      )}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
