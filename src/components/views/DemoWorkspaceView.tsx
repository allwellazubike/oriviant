import React, { useState, useMemo } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { 
  Zap, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  Award, 
  History, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
  BookOpen,
  LogOut,
  Layers,
  Users,
  Info,
  Sliders,
  Sparkles,
  ArrowRight,
  Search,
  Star,
  Eye,
  Calendar,
  BarChart2,
  Lock,
  DollarSign,
  Briefcase,
  HelpCircle,
  Check,
  AlertTriangle,
  FileText,
  Activity,
  Bookmark
} from 'lucide-react';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useTrading } from '../../contexts/TradingContext';
import { useCopyTrading } from '../../contexts/CopyTradingContext';
import { NavigationTab, CryptoCoin, AssetClass } from '../../types';
import { ResetDemoBalanceModal } from '../layout/ResetDemoBalanceModal';
import { TradingChart } from '../trading/TradingChart';
import { ACADEMY_LESSONS, MOCK_DAILY_LEARNING } from '../../data/academyData';

interface DemoWorkspaceViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DemoWorkspaceView: React.FC<DemoWorkspaceViewProps> = ({ onNavigate }) => {
  const { 
    demoBalance, 
    refillDemoFunds, 
    resetDemoBalance, 
    virtualLedger, 
    analytics, 
    setDemoMode, 
    addLedgerEntry 
  } = useDemoMode();

  const { coins } = useTrading();
  const { traders } = useCopyTrading();

  const [demoActiveSymbol, setDemoActiveSymbol] = useState<string>('BTC/USDT');

  const currentCoin = useMemo(() => {
    return coins.find(c => c.symbol === demoActiveSymbol) || coins[0] || { symbol: 'BTC/USDT', price: 80000, change24h: 2.5, name: 'Bitcoin' };
  }, [coins, demoActiveSymbol]);

  const [activeTab, setActiveTab] = useState<
    'home' | 'chart' | 'spot' | 'futures' | 'watchlist' | 'copy' | 'portfolio' | 'history' | 'analytics' | 'learning'
  >('home');

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [spotOrderType, setSpotOrderType] = useState<'market' | 'limit'>('market');
  const [spotSide, setSpotSide] = useState<'buy' | 'sell'>('buy');
  const [spotAmount, setSpotAmount] = useState('0.1');
  const [spotLimitPrice, setSpotLimitPrice] = useState(currentCoin.price.toString());
  const [showSpotConfirmModal, setShowSpotConfirmModal] = useState(false);

  const [futuresSymbol, setFuturesSymbol] = useState(demoActiveSymbol);
  const [futuresSide, setFuturesSide] = useState<'long' | 'short'>('long');
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [leverage, setLeverage] = useState(20);
  const [marginAmount, setMarginAmount] = useState('500');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [showFuturesConfirmModal, setShowFuturesConfirmModal] = useState(false);

  useOverlayRegistration('demo-reset-modal', isResetModalOpen, () => setIsResetModalOpen(false));
  useOverlayRegistration('demo-spot-confirm-modal', showSpotConfirmModal, () => setShowSpotConfirmModal(false));
  useOverlayRegistration('demo-futures-confirm-modal', showFuturesConfirmModal, () => setShowFuturesConfirmModal(false));

  const [practiceOpenOrders, setPracticeOpenOrders] = useState<Array<{
    id: string;
    pair: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    amount: number;
    total: number;
    timestamp: string;
    status: 'open' | 'filled' | 'canceled' | 'closed'; // 🔥 FIX: Added 'closed'
  }>>(() => {
    const saved = localStorage.getItem('oriviant_demo_open_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [practicePositions, setPracticePositions] = useState<Array<{
    id: string;
    pair: string;
    side: 'long' | 'short';
    marginMode: 'cross' | 'isolated';
    leverage: number;
    margin: number;
    entryPrice: number;
    markPrice: number;
    liquidationPrice: number;
    size: number;
    pnl: number;
    roe: number;
    tp?: string;
    sl?: string;
  }>>(() => {
    const saved = localStorage.getItem('oriviant_demo_positions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [copiedTraders, setCopiedTraders] = useState<any[]>(() => {
    const saved = localStorage.getItem('oriviant_demo_copy');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('oriviant_demo_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'EUR/USD', 'XAU/USD'];
  });

  React.useEffect(() => {
    localStorage.setItem('oriviant_demo_open_orders', JSON.stringify(practiceOpenOrders));
  }, [practiceOpenOrders]);

  React.useEffect(() => {
    localStorage.setItem('oriviant_demo_positions', JSON.stringify(practicePositions));
  }, [practicePositions]);

  React.useEffect(() => {
    localStorage.setItem('oriviant_demo_copy', JSON.stringify(copiedTraders));
  }, [copiedTraders]);

  React.useEffect(() => {
    localStorage.setItem('oriviant_demo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  React.useEffect(() => {
    const handleReset = () => {
      setPracticeOpenOrders([]);
      setPracticePositions([]);
      setCopiedTraders([]);
    };
    window.addEventListener('oriviant_demo_reset', handleReset);
    return () => window.removeEventListener('oriviant_demo_reset', handleReset);
  }, []);

  const [watchlistCategory, setWatchlistCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTradeAsset = (coin: CryptoCoin, preferredType?: 'spot' | 'futures') => {
    setDemoActiveSymbol(coin.symbol);
    const isFutures = preferredType === 'futures' || coin.category === 'futures' || coin.symbol.endsWith('PERP');
    if (isFutures) {
      setFuturesSymbol(coin.symbol);
      setActiveTab('futures');
    } else {
      setActiveTab('spot');
    }
  };

  const [selectedTraderForCopy, setSelectedTraderForCopy] = useState<any | null>(null);
  const [copyAmountVirtual, setCopyAmountVirtual] = useState('1000');
  useOverlayRegistration('copy-trader-modal', !!selectedTraderForCopy, () => setSelectedTraderForCopy(null));

  const [learningPath, setLearningPath] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [activeLessonId, setActiveLessonId] = useState<string | null>('beg-01');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleExitPracticeMode = () => {
    setDemoMode(false);
    onNavigate('home');
  };

  const handleConfirmSpotOrder = () => {
    const amt = parseFloat(spotAmount);
    if (!amt || amt <= 0) return;
    const price = spotOrderType === 'market' ? currentCoin.price : (parseFloat(spotLimitPrice) || currentCoin.price);
    const totalCost = amt * price;

    if (totalCost > demoBalance) {
      triggerToast('Insufficient Virtual USDT balance for this practice trade.');
      setShowSpotConfirmModal(false);
      return;
    }

    addLedgerEntry({
      type: 'spot_execution' as any,
      amount: -totalCost,
      description: `Practice Spot: ${spotSide.toUpperCase()} ${amt} ${currentCoin.symbol}`
    });

    const newOrder = {
      id: `ord-${Date.now()}`,
      pair: currentCoin.symbol,
      type: spotOrderType as 'market' | 'limit',
      side: spotSide,
      price,
      amount: amt,
      total: totalCost,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: spotOrderType === 'limit' ? 'open' as const : 'filled' as const
    };
    
    setPracticeOpenOrders(prev => [newOrder, ...prev]);
    triggerToast(`Practice Spot ${spotSide.toUpperCase()} Order ${spotOrderType === 'limit' ? 'Placed' : 'Filled'}!`);
    setShowSpotConfirmModal(false);
  };

  // 🔥 FIX: Added logic to safely close an active Spot asset and realize the PnL
  const handleCloseSpotTrade = (ord: any) => {
    const currentMarketPrice = coins.find(c => c.symbol === ord.pair)?.price || ord.price;
    const currentTotal = ord.amount * currentMarketPrice;
    
    // Calculate PnL
    const pnl = ord.side === 'buy' ? currentTotal - ord.total : ord.total - currentTotal;
    const refundAmount = ord.total + pnl;

    addLedgerEntry({
      type: pnl >= 0 ? 'trade_profit' : 'trade_loss',
      amount: refundAmount,
      description: `Closed Spot ${ord.side.toUpperCase()} ${ord.pair} (PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`
    });

    setPracticeOpenOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'closed' } : o));
    triggerToast(`Closed Practice Spot Position on ${ord.pair}!`);
  };

  const handleCancelOpenOrder = (id: string, pair: string, total: number) => {
    setPracticeOpenOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'canceled' } : o));
    addLedgerEntry({ type: 'trade_profit', amount: total, description: `Canceled Practice Limit Order on ${pair} (Refunded)` });
    triggerToast(`Canceled Practice Order for ${pair}`);
  };

  const handleConfirmFuturesOrder = () => {
    const margin = parseFloat(marginAmount);
    if (!margin || margin <= 0) return;

    if (margin > demoBalance) {
      triggerToast('Margin amount exceeds available Practice Virtual USDT balance.');
      setShowFuturesConfirmModal(false);
      return;
    }

    const currentFuturesCoin = coins.find(c => c.symbol === futuresSymbol) || currentCoin;
    const price = currentFuturesCoin.price;
    const positionSize = margin * leverage;
    const liqDistance = (100 / leverage) * 0.95;
    const liqPrice = futuresSide === 'long' ? price * (1 - liqDistance / 100) : price * (1 + liqDistance / 100);

    const newPos = {
      id: `pos-${Date.now()}`,
      pair: futuresSymbol,
      side: futuresSide,
      marginMode,
      leverage,
      margin,
      entryPrice: price,
      markPrice: price,
      liquidationPrice: liqPrice,
      size: positionSize,
      pnl: margin * (leverage * 0.004),
      roe: leverage * 0.4,
      tp: takeProfitPrice || undefined,
      sl: stopLossPrice || undefined
    };

    addLedgerEntry({
      type: 'margin_lock' as any,
      amount: -margin,
      description: `Locked Margin for Practice Futures ${leverage}x ${futuresSide.toUpperCase()} Position on ${futuresSymbol}`
    });

    setPracticePositions(prev => [newPos, ...prev]);
    triggerToast(`Opened Practice ${leverage}x ${futuresSide.toUpperCase()} Position on ${futuresSymbol}!`);
    setShowFuturesConfirmModal(false);
  };

  const handleClosePosition = (id: string, pnl: number, pair: string) => {
    const pos = practicePositions.find(p => p.id === id);
    if (pos) {
      addLedgerEntry({
        type: pnl >= 0 ? 'trade_profit' : 'trade_loss',
        amount: pos.margin + pnl,
        description: `Closed Practice Futures Position on ${pair} (Returned Margin + ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} PnL)`
      });
    }
    setPracticePositions(prev => prev.filter(p => p.id !== id));
    triggerToast(`Closed Practice Position on ${pair}!`);
  };

  const handleStartCopyTrading = () => {
    const amt = parseFloat(copyAmountVirtual) || 1000;
    
    if (amt > demoBalance) {
      triggerToast('Allocation amount exceeds available Virtual Balance.');
      return;
    }

    addLedgerEntry({
      type: 'copy_allocation' as any,
      amount: -amt,
      description: `Allocated ${amt.toLocaleString()} USDT Virtual Funds to Copy ${selectedTraderForCopy.name}`
    });

    setCopiedTraders(prev => [{ ...selectedTraderForCopy, copyAmount: amt, id: Date.now() }, ...prev]);
    triggerToast(`Allocated $${amt.toLocaleString()} Virtual Funds to copy ${selectedTraderForCopy.name}!`);
    setSelectedTraderForCopy(null);
  };

  const handleStopCopy = (id: string, amount: number) => {
    setCopiedTraders(prev => prev.filter(t => t.id !== id));
    addLedgerEntry({
      type: 'trade_profit',
      amount: amount,
      description: `Stopped Copying Trader (Refunded ${amount.toLocaleString()} USDT)`
    });
    triggerToast('Stopped Copying Trader and refunded virtual balance.');
  };

  const filteredCoins = useMemo(() => {
    return coins.filter(c => {
      const matchesSearch = c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (watchlistCategory === 'favorites') return matchesSearch && favorites.includes(c.symbol);
      if (watchlistCategory === 'crypto') return matchesSearch && (c.assetClass === 'crypto' || !c.assetClass);
      if (watchlistCategory === 'forex') return matchesSearch && c.assetClass === 'forex';
      if (watchlistCategory === 'stocks') return matchesSearch && c.assetClass === 'stocks';
      if (watchlistCategory === 'etfs') return matchesSearch && c.assetClass === 'etfs';
      if (watchlistCategory === 'commodities') return matchesSearch && (c.assetClass === 'commodities' || c.assetClass === 'metals' || c.assetClass === 'energy');
      if (watchlistCategory === 'indices') return matchesSearch && c.assetClass === 'indices';
      return matchesSearch;
    });
  }, [coins, searchQuery, watchlistCategory, favorites]);

  const currentLesson = useMemo(() => {
    return ACADEMY_LESSONS.find(l => l.id === activeLessonId) || ACADEMY_LESSONS[0];
  }, [activeLessonId]);

  return (
    <div className="space-y-6 pb-16">
      
      <ResetDemoBalanceModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />

      {showSpotConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-app-card border border-app rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Confirm Practice Spot Order</span>
              </h3>
              <button onClick={() => setShowSpotConfirmModal(false)} className="text-app-sec hover:text-app">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-app-sec/60 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-app-sec">Asset Pair:</span>
                <strong className="text-app font-bold">{currentCoin.symbol}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Order Type & Side:</span>
                <strong className={spotSide === 'buy' ? 'text-positive font-bold' : 'text-negative font-bold'}>
                  {spotOrderType.toUpperCase()} {spotSide.toUpperCase()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Order Amount:</span>
                <strong className="text-app">{spotAmount} {currentCoin.symbol.split('/')[0]}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Execution Price:</span>
                <strong className="text-app">${(spotOrderType === 'market' ? currentCoin.price : parseFloat(spotLimitPrice)).toLocaleString()} USDT</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-app/60 font-bold">
                <span className="text-app-sec">Total Virtual Cost:</span>
                <strong className="text-emerald-500">${((parseFloat(spotAmount) || 0) * (spotOrderType === 'market' ? currentCoin.price : parseFloat(spotLimitPrice))).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
              </div>
            </div>

            <p className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
              ⚡ Practice Mode order. Uses virtual funds only — 100% risk-free.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSpotConfirmModal(false)}
                className="py-2.5 rounded-xl bg-app-sec text-app-sec font-bold text-xs hover:bg-app-sec/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSpotOrder}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showFuturesConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-app-card border border-app rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                <span>Confirm Practice Futures Position</span>
              </h3>
              <button onClick={() => setShowFuturesConfirmModal(false)} className="text-app-sec hover:text-app">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-app-sec/60 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-app-sec">Futures Contract:</span>
                <strong className="text-app font-bold">{futuresSymbol} PERP</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Side & Leverage:</span>
                <strong className={futuresSide === 'long' ? 'text-positive font-bold' : 'text-negative font-bold'}>
                  {leverage}x {marginMode.toUpperCase()} {futuresSide.toUpperCase()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Virtual Margin:</span>
                <strong className="text-app">${marginAmount} USDT</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-app-sec">Total Position Exposure:</span>
                <strong className="text-amber-400">${((parseFloat(marginAmount) || 0) * leverage).toLocaleString()} USDT</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-app/60 font-bold">
                <span className="text-app-sec">Est. Liquidation Distance:</span>
                <strong className="text-amber-500">~{(100 / leverage).toFixed(2)}%</strong>
              </div>
            </div>

            <p className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
              🛡️ Practice Mode simulator. No real capital or liquidation risks involved.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowFuturesConfirmModal(false)}
                className="py-2.5 rounded-xl bg-app-sec text-app-sec font-bold text-xs hover:bg-app-sec/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFuturesOrder}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Futures Order
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTraderForCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-app-card border border-app rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedTraderForCopy.avatar} alt={selectedTraderForCopy.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-extrabold text-app">{selectedTraderForCopy.name}</h3>
                  <span className="text-[10px] text-emerald-500 font-bold">Practice Copy Trading</span>
                </div>
              </div>
              <button onClick={() => setSelectedTraderForCopy(null)} className="text-app-sec hover:text-app">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Virtual USDT Allocation</label>
                <input
                  type="number"
                  value={copyAmountVirtual}
                  onChange={(e) => setCopyAmountVirtual(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-app-sec/60 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-app-sec">
                  <span>Available Virtual Balance:</span>
                  <strong className="text-emerald-500">${demoBalance.toLocaleString()} USDT</strong>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>7D Win Rate:</span>
                  <strong className="text-app">{selectedTraderForCopy.winRate}%</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSelectedTraderForCopy(null)}
                className="py-2.5 rounded-xl bg-app-sec text-app-sec font-bold text-xs hover:bg-app-sec/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCopyTrading}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Start Practice Copying
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs text-app-sec hover:text-app">Dismiss</button>
        </div>
      )}

      <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Practice Mode uses virtual funds. No real money, deposits, or withdrawals are involved.</span>
        </div>
        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Risk-Free Simulator</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              PRACTICE MODE • TRADING WITH VIRTUAL FUNDS
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            ORIVIANT Practice Trading Simulator
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Master Spot trading, 125x Futures leverage, technical charts, and Copy Trading strategies with 10,000 USDT virtual funds. Real live orderbooks and streaming market prices.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExitPracticeMode}
              className="px-5 py-2.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs shadow-lg shadow-accent/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Return to Live Trading</span>
            </button>
          </div>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md space-y-3 shrink-0 relative z-10 w-full md:w-auto">
          <div className="text-xs text-slate-300 font-medium">
            Available Virtual Balance:
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => refillDemoFunds(5000)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              +$5,000
            </button>
            <button
              onClick={() => refillDemoFunds(10000)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              +$10,000
            </button>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 10,000 USDT</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-app">
        {[
          { id: 'home', label: 'Practice Dashboard', icon: PieChart },
          { id: 'chart', label: 'Live Chart & Markets', icon: TrendingUp },
          { id: 'spot', label: 'Spot Trading', icon: Layers },
          { id: 'futures', label: 'Futures Trading (125x)', icon: Zap },
          { id: 'watchlist', label: 'Watchlist & Orderbook', icon: Star },
          { id: 'copy', label: 'Copy Trading', icon: Users },
          { id: 'portfolio', label: 'Portfolio Analytics', icon: Briefcase },
          { id: 'history', label: 'Trade History & Ledger', icon: History },
          { id: 'learning', label: 'Learning Center', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-app-card text-app-sec hover:text-app border border-app'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
              <span className="text-xs font-semibold text-app-sec block">Virtual Balance</span>
              <div className="text-2xl font-black text-emerald-500 font-mono">
                ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </div>
              <p className="text-[10px] text-app-sec font-medium">Reset Anytime to 10,000 USDT</p>
            </div>

            <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
              <span className="text-xs font-semibold text-app-sec block">Today's PnL</span>
              <div className="text-2xl font-black text-emerald-500 font-mono">
                +${analytics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-500 font-bold">+3.45% Today</span>
            </div>

            <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
              <span className="text-xs font-semibold text-app-sec block">Win Rate</span>
              <div className="text-2xl font-black text-app">{analytics.winRate}%</div>
              <div className="flex items-center gap-2 text-[10px] text-app-sec pt-0.5">
                <span className="text-emerald-500 font-bold">{analytics.winningTrades} Wins</span>
                <span>/</span>
                <span className="text-red-500 font-bold">{analytics.losingTrades} Losses</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
              <span className="text-xs font-semibold text-app-sec block">Active Positions & Orders</span>
              <div className="text-2xl font-black text-app">
                {practicePositions.length + practiceOpenOrders.length}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-app-sec pt-0.5">
                <span className="text-accent font-bold">{practicePositions.length} Positions</span>
                <span>•</span>
                <span className="text-app font-bold">{practiceOpenOrders.filter(o => o.status === 'open').length} Orders</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-app-card border border-app flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Spot Practice Simulator</span>
                </div>
                <h3 className="text-base font-extrabold text-app">Trade Spot Assets Risk-Free</h3>
                <p className="text-xs text-app-sec mt-1">Execute Instant Market and Target Limit orders with live orderbooks across Crypto, Forex, and Stocks.</p>
              </div>
              <button
                onClick={() => setActiveTab('spot')}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto self-start"
              >
                <span>Launch Spot Trading</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-app-card border border-app flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Futures 125x Leverage</span>
                </div>
                <h3 className="text-base font-extrabold text-app">Test High Leverage Futures</h3>
                <p className="text-xs text-app-sec mt-1">Open Long and Short positions up to 125x leverage, set Take Profit & Stop Loss triggers, and test liquidation protection.</p>
              </div>
              <button
                onClick={() => setActiveTab('futures')}
                className="py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto self-start"
              >
                <span>Launch Futures Trading</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-sm font-bold text-app flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                <span>Recent Practice Activity</span>
              </h3>
              <button onClick={() => setActiveTab('history')} className="text-xs text-emerald-500 font-bold hover:underline">View Full Ledger →</button>
            </div>

            <div className="space-y-2">
              {virtualLedger.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-3.5 rounded-xl bg-app-sec/40 border border-app/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-app block">{entry.description}</span>
                    <span className="text-[10px] text-app-sec">{entry.timestamp}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`font-bold block ${entry.amount >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {entry.amount >= 0 ? '+' : ''}${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-app-sec">Balance: ${entry.balanceAfter.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CHART & MARKETS */}
      {activeTab === 'chart' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-app-card border border-app flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-app-sec">Select Market Pair:</span>
              <select
                value={demoActiveSymbol}
                onChange={(e) => setDemoActiveSymbol(e.target.value)}
                className="bg-app-sec border border-app rounded-xl px-4 py-2 text-xs font-bold text-app cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {coins.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol} — ${c.price.toLocaleString()} ({c.change24h >= 0 ? '+' : ''}{c.change24h}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-app-sec font-mono">
              Live Feed: <strong className="text-emerald-500 font-bold">${currentCoin.price.toLocaleString()} USDT</strong>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-app-card border border-app shadow-lg min-h-[480px]">
            {/* @ts-ignore */}
            <TradingChart key={`chart-${currentCoin.symbol}`} coin={currentCoin} symbol={currentCoin.symbol} height={460} showToolbar={true} />
          </div>
        </div>
      )}

      {/* TAB 3: SPOT TRADING */}
      {activeTab === 'spot' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-app-card border border-app shadow-sm min-h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-app mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={currentCoin.symbol}
                  onChange={(e) => setDemoActiveSymbol(e.target.value)}
                  className="bg-app-sec border border-app rounded-xl px-3 py-1.5 text-xs font-bold text-app cursor-pointer focus:outline-none"
                >
                  {coins.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol} SPOT</option>
                  ))}
                </select>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase">
                  PRACTICE SPOT
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-500">
                ${currentCoin.price.toLocaleString()} USDT ({currentCoin.change24h >= 0 ? '+' : ''}{currentCoin.change24h}%)
              </div>
            </div>
            {/* @ts-ignore */}
            <TradingChart key={`spot-${currentCoin.symbol}`} coin={currentCoin} symbol={currentCoin.symbol} height={360} showToolbar={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-app-card border border-app space-y-4">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-base font-bold text-app flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Practice Spot Order Simulator</span>
              </h3>
              <span className="text-xs text-app-sec font-mono">
                Virtual Balance: <strong className="text-emerald-500">${demoBalance.toLocaleString()} USDT</strong>
              </span>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowSpotConfirmModal(true); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Order Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-app-sec p-1 rounded-xl border border-app text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSpotOrderType('market')}
                      className={`py-1.5 rounded-lg ${spotOrderType === 'market' ? 'bg-app-card text-emerald-500 shadow-xs' : 'text-app-sec'}`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpotOrderType('limit')}
                      className={`py-1.5 rounded-lg ${spotOrderType === 'limit' ? 'bg-app-card text-emerald-500 shadow-xs' : 'text-app-sec'}`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Order Side</label>
                  <div className="grid grid-cols-2 gap-1 bg-app-sec p-1 rounded-xl border border-app text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSpotSide('buy')}
                      className={`py-1.5 rounded-lg ${spotSide === 'buy' ? 'bg-positive text-white' : 'text-app-sec'}`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpotSide('sell')}
                      className={`py-1.5 rounded-lg ${spotSide === 'sell' ? 'bg-negative text-white' : 'text-app-sec'}`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              {spotOrderType === 'limit' && (
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Limit Target Price (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={spotLimitPrice}
                    onChange={(e) => setSpotLimitPrice(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Order Amount ({currentCoin.symbol.split('/')[0]})</label>
                <input
                  type="number"
                  step="0.01"
                  value={spotAmount}
                  onChange={(e) => setSpotAmount(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app font-mono"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-app-sec/60 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-app-sec">
                  <span>Current Market Price:</span>
                  <strong className="text-app">${currentCoin.price.toLocaleString()} USDT</strong>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Total Virtual Cost:</span>
                  <strong className="text-emerald-500 font-bold">${((parseFloat(spotAmount) || 0) * (spotOrderType === 'market' ? currentCoin.price : parseFloat(spotLimitPrice) || currentCoin.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</strong>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md cursor-pointer transition-all ${
                  spotSide === 'buy' ? 'bg-positive hover:bg-positive/90' : 'bg-negative hover:bg-negative/90'
                }`}
              >
                Preview & Confirm Spot {spotSide.toUpperCase()} Order
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-app-card border border-app space-y-3">
            <h4 className="text-sm font-bold text-app">Market Asset Selector</h4>
            <div className="space-y-2">
              {coins.slice(0, 6).map(c => (
                <div
                  key={c.symbol}
                  onClick={() => setDemoActiveSymbol(c.symbol)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    currentCoin.symbol === c.symbol ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-app-sec/40 border-app/60 hover:bg-app-sec/80'
                  }`}
                >
                  <div>
                    <span className="font-bold text-app block">{c.symbol}</span>
                    <span className="text-[10px] text-app-sec">{c.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-app block">${c.price.toLocaleString()}</span>
                    <span className={c.change24h >= 0 ? 'text-positive text-[10px]' : 'text-negative text-[10px]'}>
                      {c.change24h >= 0 ? '+' : ''}{c.change24h}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 FIX: Upgraded Spot Order History Table with powerful actions */}
          <div className="lg:col-span-3 pt-6 border-t border-app space-y-3">
            <h4 className="text-sm font-bold text-app flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              <span>Practice Spot Orders & History</span>
            </h4>

            {practiceOpenOrders.length === 0 ? (
              <p className="text-xs text-app-sec py-4 text-center">No practice spot orders executed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                      <th className="py-2.5 px-2">Time</th>
                      <th className="py-2.5 px-2">Pair</th>
                      <th className="py-2.5 px-2">Type/Side</th>
                      <th className="py-2.5 px-2 text-right">Price</th>
                      <th className="py-2.5 px-2 text-right">Amount</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                      <th className="py-2.5 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app text-xs font-mono">
                    {practiceOpenOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-app-sec/40 transition-colors">
                        <td className="py-3 px-2 text-app-sec">{ord.timestamp}</td>
                        <td className="py-3 px-2 font-bold text-app">{ord.pair}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ord.side === 'buy' ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative'}`}>
                            {ord.type} {ord.side}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-app">${ord.price.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-app">{ord.amount}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-[10px] font-bold uppercase ${(!ord.status && ord.type === 'limit') || ord.status === 'open' ? 'text-amber-500' : (!ord.status && ord.type === 'market') || ord.status === 'filled' ? 'text-emerald-500' : 'text-app-sec'}`}>
                            {ord.status || (ord.type === 'limit' ? 'OPEN' : 'FILLED')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {((!ord.status && ord.type === 'limit') || ord.status === 'open') && (
                              <button
                                onClick={() => handleCancelOpenOrder(ord.id, ord.pair, ord.total)}
                                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            {((!ord.status && ord.type === 'market') || ord.status === 'filled') && (
                              <button
                                onClick={() => handleCloseSpotTrade(ord)}
                                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold cursor-pointer"
                              >
                                Close
                              </button>
                            )}
                            {(ord.status === 'canceled' || ord.status === 'closed') && (
                              <button
                                onClick={() => setPracticeOpenOrders(prev => prev.filter(o => o.id !== ord.id))}
                                className="px-2 py-1 rounded bg-app-sec/40 hover:bg-app-sec/60 text-app-sec text-[10px] font-bold cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
      )}

      {/* TAB 4: FUTURES TRADING */}
      {activeTab === 'futures' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-app-card border border-app shadow-sm min-h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-app mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={futuresSymbol}
                  onChange={(e) => setFuturesSymbol(e.target.value)}
                  className="bg-app-sec border border-app rounded-xl px-3 py-1.5 text-xs font-bold text-app cursor-pointer focus:outline-none"
                >
                  {coins.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol} PERP</option>
                  ))}
                </select>
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase">
                  125X FUTURES PRACTICE
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-red-500">
                ${(coins.find(c => c.symbol === futuresSymbol) || currentCoin).price.toLocaleString()} USDT
              </div>
            </div>
            {/* @ts-ignore */}
            <TradingChart key={`futures-${futuresSymbol}`} coin={coins.find(c => c.symbol === futuresSymbol) || currentCoin} symbol={futuresSymbol} height={360} showToolbar={true} />
          </div>

          <div className="p-6 rounded-2xl bg-app-card border border-app space-y-6">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-base font-bold text-app flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                <span>Practice Futures 125x Simulator</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase">
                UP TO 125X LEVERAGE
              </span>
            </div>

          <form onSubmit={(e) => { e.preventDefault(); setShowFuturesConfirmModal(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Futures Contract</label>
                <select
                  value={futuresSymbol}
                  onChange={(e) => setFuturesSymbol(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app cursor-pointer"
                >
                  {coins.map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol} PERP</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Margin Mode</label>
                  <div className="grid grid-cols-2 gap-1 bg-app-sec p-1 rounded-xl border border-app text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMarginMode('cross')}
                      className={`py-1 rounded-lg ${marginMode === 'cross' ? 'bg-app-card text-emerald-500 shadow-xs' : 'text-app-sec'}`}
                    >
                      Cross
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarginMode('isolated')}
                      className={`py-1 rounded-lg ${marginMode === 'isolated' ? 'bg-app-card text-emerald-500 shadow-xs' : 'text-app-sec'}`}
                    >
                      Isolated
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Position Side</label>
                  <div className="grid grid-cols-2 gap-1 bg-app-sec p-1 rounded-xl border border-app text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFuturesSide('long')}
                      className={`py-1 rounded-lg ${futuresSide === 'long' ? 'bg-positive text-white' : 'text-app-sec'}`}
                    >
                      LONG ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => setFuturesSide('short')}
                      className={`py-1 rounded-lg ${futuresSide === 'short' ? 'bg-negative text-white' : 'text-app-sec'}`}
                    >
                      SHORT ↘
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-app-sec mb-1">
                  <span>Leverage Multiplier:</span>
                  <strong className="text-amber-500 font-extrabold font-mono">{leverage}x</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="125"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-app-sec font-mono mt-1">
                  <span>1x</span>
                  <span>25x</span>
                  <span>50x</span>
                  <span>75x</span>
                  <span>125x</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-sec mb-1">Virtual Margin (USDT)</label>
                <input
                  type="number"
                  value={marginAmount}
                  onChange={(e) => setMarginAmount(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Take Profit (TP)</label>
                  <input
                    type="number"
                    placeholder="e.g. 98,000"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-sec mb-1">Stop Loss (SL)</label>
                  <input
                    type="number"
                    placeholder="e.g. 89,500"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-app-sec/60 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-app-sec">
                  <span>Total Position Exposure:</span>
                  <strong className="text-app">${((parseFloat(marginAmount) || 0) * leverage).toLocaleString()} USDT</strong>
                </div>
                <div className="flex justify-between text-app-sec">
                  <span>Funding Rate (8H):</span>
                  <strong className="text-emerald-500 font-bold">+0.0100%</strong>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md cursor-pointer transition-all ${
                  futuresSide === 'long' ? 'bg-positive hover:bg-positive/90' : 'bg-negative hover:bg-negative/90'
                }`}
              >
                Preview & Confirm Futures {leverage}x {futuresSide.toUpperCase()}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-app space-y-3">
            <h4 className="text-sm font-bold text-app flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Active Practice Positions ({practicePositions.length})</span>
            </h4>

            {practicePositions.length === 0 ? (
              <p className="text-xs text-app-sec py-4 text-center">No active practice positions.</p>
            ) : (
              <div className="space-y-3">
                {practicePositions.map(pos => (
                  <div key={pos.id} className="p-4 rounded-2xl bg-app-sec/40 border border-app flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-app">{pos.pair}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.side === 'long' ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative'}`}>
                          {pos.leverage}x {pos.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-app-sec font-mono mt-1 space-x-3">
                        <span>Margin: ${pos.margin}</span>
                        <span>Entry: ${pos.entryPrice.toLocaleString()}</span>
                        <span>Liq: <strong className="text-amber-500">${pos.liquidationPrice.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-app-sec block">Unrealized PnL</span>
                        <span className="text-sm font-black text-emerald-500 font-mono">+${pos.pnl.toFixed(2)} (+{pos.roe.toFixed(1)}%)</span>
                      </div>
                      <button
                        onClick={() => handleClosePosition(pos.id, pos.pnl, pos.pair)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-all cursor-pointer"
                      >
                        Close Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* TAB 5: WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-app-card border border-app space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app pb-3">
              <h3 className="text-sm font-bold text-app flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Practice Watchlist ({filteredCoins.length})</span>
              </h3>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-app-sec absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl pl-9 pr-3 py-1.5 text-xs text-app"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Markets' },
                { id: 'favorites', label: 'Favorites ⭐' },
                { id: 'crypto', label: 'Crypto' },
                { id: 'forex', label: 'Forex' },
                { id: 'stocks', label: 'Stocks' },
                { id: 'etfs', label: 'ETFs' },
                { id: 'commodities', label: 'Commodities & Metals' },
                { id: 'indices', label: 'Indices' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setWatchlistCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    watchlistCategory === cat.id ? 'bg-emerald-500 text-white shadow-xs' : 'bg-app-sec text-app-sec hover:text-app'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                    <th className="py-2.5">Fav</th>
                    <th className="py-2.5">Asset</th>
                    <th className="py-2.5 text-right">Live Price</th>
                    <th className="py-2.5 text-right">24H Change</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app text-xs font-medium">
                  {filteredCoins.map(coin => (
                    <tr key={coin.symbol} className="hover:bg-app-sec/40 transition-colors">
                      <td className="py-3">
                        <button onClick={() => toggleFavorite(coin.symbol)} className="cursor-pointer">
                          <Star className={`w-4 h-4 ${favorites.includes(coin.symbol) ? 'text-amber-500 fill-amber-500' : 'text-app-sec'}`} />
                        </button>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-app block">{coin.symbol}</span>
                        <span className="text-[10px] text-app-sec">{coin.name}</span>
                      </td>
                      <td className="py-3 text-right font-bold text-app font-mono">
                        ${coin.price.toLocaleString()}
                      </td>
                      <td className={`py-3 text-right font-bold font-mono ${coin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTradeAsset(coin, 'spot')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs border border-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                          >
                            Trade Spot
                          </button>
                          <button
                            onClick={() => handleTradeAsset(coin, 'futures')}
                            className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs border border-red-500/20 transition-all cursor-pointer whitespace-nowrap"
                          >
                            Futures
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-app-card border border-app space-y-3 font-mono text-xs">
            <h4 className="text-sm font-bold text-app font-sans border-b border-app pb-2">Live Order Book ({currentCoin.symbol})</h4>
            
            <div className="space-y-1 text-negative">
              {[
                { price: currentCoin.price * 1.002, size: 1.45, depth: 75 },
                { price: currentCoin.price * 1.001, size: 0.82, depth: 45 },
                { price: currentCoin.price * 1.0005, size: 2.10, depth: 90 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-negative/10" style={{ width: `${row.depth}%` }} />
                  <span className="relative z-10">${row.price.toFixed(2)}</span>
                  <span className="relative z-10 text-app-sec">{row.size}</span>
                </div>
              ))}
            </div>

            <div className="py-2 my-1 text-center font-extrabold text-sm text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              ${currentCoin.price.toLocaleString()} USDT
            </div>

            <div className="space-y-1 text-positive">
              {[
                { price: currentCoin.price * 0.9995, size: 3.12, depth: 85 },
                { price: currentCoin.price * 0.999, size: 1.20, depth: 50 },
                { price: currentCoin.price * 0.998, size: 4.50, depth: 95 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-positive/10" style={{ width: `${row.depth}%` }} />
                  <span className="relative z-10">${row.price.toFixed(2)}</span>
                  <span className="relative z-10 text-app-sec">{row.size}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: COPY TRADING */}
      {activeTab === 'copy' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-app-card border border-app flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-app">Practice Copy Trading Simulator</h3>
              <p className="text-xs text-app-sec">Simulate following top Lead Traders using virtual funds only.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {traders.map((trader) => (
              <div key={trader.id} className="p-5 rounded-2xl bg-app-card border border-app space-y-3">
                <div className="flex items-center gap-3">
                  <img src={trader.avatar} alt={trader.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-sm text-app block">{trader.name}</span>
                    <span className="text-[10px] text-emerald-500 font-bold">7D ROI: +{trader.roi7d}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-app">
                  <div>
                    <span className="text-[10px] text-app-sec block">Win Rate</span>
                    <span className="font-bold text-app">{trader.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-sec block">Risk Score</span>
                    <span className="font-bold text-amber-500">{trader.riskScore}/10</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTraderForCopy(trader)}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Copy with Virtual Funds
                </button>
              </div>
            ))}
          </div>

          {copiedTraders.length > 0 && (
            <div className="pt-6 border-t border-app space-y-4">
              <h4 className="text-sm font-bold text-app flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Active Practice Copy Traders</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {copiedTraders.map(ct => (
                  <div key={ct.id} className="p-4 rounded-2xl bg-app-sec/40 border border-app flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <img src={ct.avatar} className="w-8 h-8 rounded-full" />
                        <div>
                          <span className="text-sm font-bold text-app">{ct.name}</span>
                          <span className="text-[10px] text-app-sec block font-mono">Allocated: ${ct.copyAmount.toLocaleString()} USDT</span>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleStopCopy(ct.id, ct.copyAmount)} 
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold transition-all cursor-pointer"
                     >
                       Stop Copying
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 8: PRACTICE HISTORY */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-app-card border border-app shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-app pb-3">
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <span>Virtual Ledger Audit Trail</span>
            </h3>
            <span className="text-xs text-app-sec">Isolated from Live History</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                  <th className="py-2.5">Date & Time</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app text-xs font-medium">
                {virtualLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-app-sec/40 transition-colors">
                    <td className="py-3 text-app-sec">{entry.timestamp}</td>
                    <td className="py-3 uppercase font-bold text-app">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        entry.type === 'refill' ? 'bg-blue-500/10 text-blue-500' :
                        entry.type === 'trade_profit' ? 'bg-emerald-500/10 text-emerald-500' : 
                        ['spot_execution', 'margin_lock', 'copy_allocation'].includes(entry.type as string) ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {(entry.type as string).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-app">{entry.description}</td>
                    <td className={`py-3 text-right font-extrabold font-mono ${entry.amount >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {entry.amount >= 0 ? '+' : ''}${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-app font-bold font-mono">
                      ${entry.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: LEARNING CENTER */}
      {activeTab === 'learning' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 text-white space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Practice Trading Tip of the Day</span>
            </div>
            <h3 className="text-lg font-black">{MOCK_DAILY_LEARNING.dailyTip.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{MOCK_DAILY_LEARNING.dailyTip.tip}</p>
          </div>

          <div className="flex items-center gap-2 border-b border-app pb-2">
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map(path => (
              <button
                key={path}
                onClick={() => setLearningPath(path)}
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                  learningPath === path ? 'bg-emerald-500 text-white shadow-md' : 'bg-app-card text-app-sec hover:text-app'
                }`}
              >
                {path} Curriculum
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACADEMY_LESSONS.filter(l => l.path === learningPath).map(lesson => (
              <div
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  activeLessonId === lesson.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md' : 'bg-app-card border-app hover:border-app/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                  <span>Lesson {lesson.lessonNumber}</span>
                  <span className="text-app-sec text-[10px]">{lesson.estimatedDuration}</span>
                </div>
                <h4 className="font-extrabold text-sm text-app">{lesson.title}</h4>
                <p className="text-xs text-app-sec line-clamp-2">{lesson.summary}</p>
              </div>
            ))}
          </div>

          {currentLesson && (
            <div className="p-6 rounded-3xl bg-app-card border border-app space-y-6">
              <div className="border-b border-app pb-4">
                <span className="text-xs font-bold text-emerald-500 uppercase">{currentLesson.path} • Lesson {currentLesson.lessonNumber}</span>
                <h2 className="text-xl font-black text-app mt-1">{currentLesson.title}</h2>
                <p className="text-xs text-app-sec mt-1">{currentLesson.summary}</p>
              </div>

              <div className="space-y-4">
                {currentLesson.sections.map((sec, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-app-sec/40 space-y-2">
                    <h4 className="font-bold text-sm text-app">{sec.heading}</h4>
                    <p className="text-xs text-app-sec leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>

              {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                <div className="p-6 rounded-2xl bg-app-sec/60 border border-app/80 space-y-4">
                  <h4 className="font-extrabold text-sm text-app flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Interactive Practice Quiz</span>
                  </h4>

                  {currentLesson.quiz.map((q) => {
                    const selected = selectedQuizAnswers[q.id];
                    const submitted = quizSubmitted[q.id];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div key={q.id} className="space-y-3 pt-2">
                        <p className="text-xs font-bold text-app">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || []).map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setSelectedQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                setQuizSubmitted(prev => ({ ...prev, [q.id]: true }));
                              }}
                              className={`p-3 rounded-xl text-xs text-left font-semibold border transition-all cursor-pointer ${
                                submitted && optIdx === q.correctIndex
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                                  : submitted && selected === optIdx && !isCorrect
                                  ? 'bg-red-500/20 border-red-500 text-red-400'
                                  : 'bg-app-card border-app text-app hover:border-emerald-500/50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {submitted && (
                          <div className={`p-3 rounded-xl text-xs font-medium ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {isCorrect ? q.explanationCorrect : q.explanationWrong}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};