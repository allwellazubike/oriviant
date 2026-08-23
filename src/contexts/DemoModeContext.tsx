import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOverlayRegistration } from '../utils/OverlayRegistry';
import { VirtualLedgerEntry, DemoAnalytics } from '../types';
import { practiceApi } from '../api/practice';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (val: boolean) => void;
  demoBalance: number;
  refillDemoFunds: (amount?: number) => void;
  resetDemoBalance: () => void;
  setDemoBalanceDirect: (amount: number) => void;
  virtualLedger: VirtualLedgerEntry[];
  addLedgerEntry: (entry: Omit<VirtualLedgerEntry, 'id' | 'timestamp' | 'balanceAfter'>) => void;
  analytics: DemoAnalytics;
  hasSeenWelcome: boolean;
  dismissWelcomeModal: () => void;
  showWelcomeModal: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const INITIAL_DEMO_BALANCE = 10000;

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('oriviant_demo_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    const saved = localStorage.getItem('oriviant_demo_welcome_seen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  // Show welcome modal automatically if entering demo mode for the first time
  useEffect(() => {
    if (isDemoMode && !hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, [isDemoMode, hasSeenWelcome]);

  const dismissWelcomeModal = () => {
    setHasSeenWelcome(true);
    setShowWelcomeModal(false);
    localStorage.setItem('oriviant_demo_welcome_seen', 'true');
  };

  const openWelcomeModal = () => setShowWelcomeModal(true);
  const closeWelcomeModal = () => setShowWelcomeModal(false);

  useOverlayRegistration('demo-welcome-modal', showWelcomeModal, closeWelcomeModal);

  const [demoBalance, setDemoBalance] = useState<number>(() => {
    const saved = localStorage.getItem('oriviant_demo_balance');
    return saved ? parseFloat(saved) : INITIAL_DEMO_BALANCE;
  });

  const [virtualLedger, setVirtualLedger] = useState<VirtualLedgerEntry[]>(() => {
    const saved = localStorage.getItem('oriviant_demo_ledger');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'ledg-init',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'refill',
        amount: 10000,
        description: 'Initial Virtual Demo Capital Allocation (10,000 USDT)',
        balanceAfter: 10000
      }
    ];
  });

  const [analytics, setAnalytics] = useState<DemoAnalytics>(() => {
    const saved = localStorage.getItem('oriviant_demo_analytics');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      totalRefills: 10000,
      totalTradesCount: 16,
      winningTrades: 12,
      losingTrades: 4,
      totalProfit: 3450.80,
      totalLoss: 620.20,
      winRate: 75.0,
      lossRate: 25.0,
      avgProfit: 287.56,
      avgLoss: 155.05,
      largestWin: 1250.00,
      largestLoss: -310.00,
      profitFactor: 5.56,
      riskRewardRatio: 1.85,
      currentStreak: 3,
      longestWinStreak: 5,
      bestTradePnL: 1250.00
    };
  });

  useEffect(() => {
    localStorage.setItem('oriviant_demo_mode', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem('oriviant_demo_balance', demoBalance.toString());
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('oriviant_demo_ledger', JSON.stringify(virtualLedger));
  }, [virtualLedger]);

  useEffect(() => {
    localStorage.setItem('oriviant_demo_analytics', JSON.stringify(analytics));
  }, [analytics]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const setDemoMode = (val: boolean) => {
    setIsDemoMode(val);
  };

  const refillDemoFunds = (amount = 10000) => {
    setDemoBalance((prev) => {
      const newBal = prev + amount;
      const newLedgerEntry: VirtualLedgerEntry = {
        id: `ledg-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'refill',
        amount,
        description: `Demo Balance Top-Up (+${amount.toLocaleString()} USDT)`,
        balanceAfter: newBal
      };
      setVirtualLedger((ledgers) => [newLedgerEntry, ...ledgers]);
      setAnalytics((prevAnalytics) => ({
        ...prevAnalytics,
        totalRefills: prevAnalytics.totalRefills + amount
      }));
      return newBal;
    });
  };

  const resetDemoBalance = () => {
    const targetBalance = 10000;
    setDemoBalance(targetBalance);
    
    const initLedger: VirtualLedgerEntry[] = [
      {
        id: `ledg-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'refill',
        amount: targetBalance,
        description: 'Reset Demo Account Balance to 10,000 USDT',
        balanceAfter: targetBalance
      }
    ];
    setVirtualLedger(initLedger);

    const initAnalytics: DemoAnalytics = {
      totalRefills: 10000,
      totalTradesCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      winRate: 0,
      lossRate: 0,
      avgProfit: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 1,
      riskRewardRatio: 1,
      currentStreak: 0,
      longestWinStreak: 0,
      bestTradePnL: 0
    };
    setAnalytics(initAnalytics);

    localStorage.removeItem('oriviant_demo_positions');
    localStorage.removeItem('oriviant_demo_open_orders');
    localStorage.setItem('oriviant_demo_balance', '10000');
    localStorage.setItem('oriviant_demo_ledger', JSON.stringify(initLedger));
    localStorage.setItem('oriviant_demo_analytics', JSON.stringify(initAnalytics));

    window.dispatchEvent(new Event('oriviant_demo_reset'));
  };

  const setDemoBalanceDirect = (amount: number) => {
    setDemoBalance(amount);
    const newLedgerEntry: VirtualLedgerEntry = {
      id: `ledg-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'refill',
      amount,
      description: `Administrator Updated Demo Balance to ${amount.toLocaleString()} USDT`,
      balanceAfter: amount
    };
    setVirtualLedger((ledgers) => [newLedgerEntry, ...ledgers]);
  };

  const addLedgerEntry = (entry: Omit<VirtualLedgerEntry, 'id' | 'timestamp' | 'balanceAfter'>) => {
    setDemoBalance((prev) => {
      const newBal = Math.max(0, prev + entry.amount);
      const fullEntry: VirtualLedgerEntry = {
        ...entry,
        id: `ledg-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        balanceAfter: newBal
      };
      setVirtualLedger((ledgers) => [fullEntry, ...ledgers]);

      // Update analytics if trade profit/loss
      if (entry.type === 'trade_profit' || entry.type === 'trade_loss') {
        // Best-effort report to the backend so admins can see real practice
        // activity — the local simulation above is the source of truth for
        // the user's own UI either way, so a failure here is silently ignored.
        practiceApi.recordTrade({ description: entry.description, pnl: entry.amount }).catch(() => {});

        setAnalytics((prevAnalytics) => {
          const isWin = entry.amount > 0;
          const wins = prevAnalytics.winningTrades + (isWin ? 1 : 0);
          const losses = prevAnalytics.losingTrades + (!isWin ? 1 : 0);
          const totalCount = wins + losses;
          const totalProf = prevAnalytics.totalProfit + (isWin ? entry.amount : 0);
          const totalLoss = prevAnalytics.totalLoss + (!isWin ? Math.abs(entry.amount) : 0);

          const winRate = totalCount > 0 ? parseFloat(((wins / totalCount) * 100).toFixed(1)) : 0;
          const lossRate = totalCount > 0 ? parseFloat(((losses / totalCount) * 100).toFixed(1)) : 0;
          const avgProfit = wins > 0 ? parseFloat((totalProf / wins).toFixed(2)) : 0;
          const avgLoss = losses > 0 ? parseFloat((totalLoss / losses).toFixed(2)) : 0;
          const profitFactor = totalLoss > 0 ? parseFloat((totalProf / totalLoss).toFixed(2)) : totalProf > 0 ? 10 : 1;
          const riskRewardRatio = avgLoss > 0 ? parseFloat((avgProfit / avgLoss).toFixed(2)) : 1.5;

          const largestWin = isWin ? Math.max(prevAnalytics.largestWin, entry.amount) : prevAnalytics.largestWin;
          const largestLoss = !isWin ? Math.min(prevAnalytics.largestLoss, entry.amount) : prevAnalytics.largestLoss;

          const currentStreak = isWin ? (prevAnalytics.currentStreak >= 0 ? prevAnalytics.currentStreak + 1 : 1) : (prevAnalytics.currentStreak <= 0 ? prevAnalytics.currentStreak - 1 : -1);
          const longestWinStreak = Math.max(prevAnalytics.longestWinStreak, currentStreak > 0 ? currentStreak : 0);

          return {
            ...prevAnalytics,
            totalTradesCount: totalCount,
            winningTrades: wins,
            losingTrades: losses,
            totalProfit: totalProf,
            totalLoss: totalLoss,
            winRate,
            lossRate,
            avgProfit,
            avgLoss,
            largestWin,
            largestLoss,
            profitFactor,
            riskRewardRatio,
            currentStreak,
            longestWinStreak,
            bestTradePnL: Math.max(prevAnalytics.bestTradePnL, entry.amount)
          };
        });
      }

      return newBal;
    });
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        setDemoMode,
        demoBalance,
        refillDemoFunds,
        resetDemoBalance,
        setDemoBalanceDirect,
        virtualLedger,
        addLedgerEntry,
        analytics,
        hasSeenWelcome,
        dismissWelcomeModal,
        showWelcomeModal,
        openWelcomeModal,
        closeWelcomeModal
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
