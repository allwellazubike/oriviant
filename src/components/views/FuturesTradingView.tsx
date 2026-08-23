import React, { useState, useEffect } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { 
  Zap, 
  ChevronDown, 
  RefreshCcw, 
  X, 
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useUser } from '../../contexts/UserContext';
import { MarginMode, PositionSide } from '../../types';
import { TradingChart } from '../trading/TradingChart';
import { TradeConfirmationModal } from '../layout/TradeConfirmationModal';
import { futuresApi } from '../../api/futures';
import { socketService } from '../../services/socketService';

export const FuturesTradingView: React.FC = () => {
  const { 
    coins, 
    activeCoin, 
    setActiveCoinSymbol, 
    positions, 
    openFuturesPosition, 
    closePosition, 
    reversePosition,
    refreshLiveOrders // FIX: Imported the refresh function
  } = useTrading();

  const { isDemoMode, demoBalance } = useDemoMode();
  const { fetchLiveWallets, walletDetails } = useUser();

  const liveFuturesUsdt = walletDetails.find(w => w.symbol === 'USDT')?.futuresBalance || 0;
  const activeAvailableBalance = isDemoMode ? demoBalance : liveFuturesUsdt;

  const [leverage, setLeverage] = useState<number>(20);
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  const [positionSide, setPositionSide] = useState<PositionSide>('long');
  const [marginAmount, setMarginAmount] = useState<string>('50');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [slPrice, setSlPrice] = useState<string>('');
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState<boolean>(false);
  const [tempLeverage, setTempLeverage] = useState<number>(20);
  const [msg, setMsg] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'chart' | 'positions'>('chart');
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useOverlayRegistration('futures-leverage-modal', isLeverageModalOpen, () => setIsLeverageModalOpen(false));
  useOverlayRegistration('futures-confirm-modal', isConfirmModalOpen, () => setIsConfirmModalOpen(false));

  useEffect(() => {
    socketService.connect();

    if (activeCoin?.symbol) {
      socketService.subscribeToMarket(activeCoin.symbol);
    }

    const handleTick = (data: any) => {
      if (data && data.price) {
        setLivePrice(data.price);
      }
    };

    const initSocket = () => {
      if (socketService.socket) {
        socketService.socket.on('market_tick', handleTick);
      } else {
        setTimeout(initSocket, 500);
      }
    };
    initSocket();

    return () => {
      if (activeCoin?.symbol) {
        socketService.unsubscribeFromMarket(activeCoin.symbol);
      }
      socketService.socket?.off('market_tick', handleTick);
    };
  }, [activeCoin?.symbol]);

  if (!activeCoin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-app-sec space-y-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm font-bold tracking-wider uppercase">Syncing Futures Market Data...</p>
      </div>
    );
  }

  const prec = activeCoin.precision || 2;
  
  // FIX: Ensure price is never 0 to prevent "Infinity" calculations
  const currentPrice = (livePrice && livePrice > 0) ? livePrice : (activeCoin.price > 0 ? activeCoin.price : 92450.80);
  
  const numMargin = parseFloat(marginAmount) || 0;
  const notionalValue = numMargin * leverage;
  const positionSize = notionalValue / currentPrice;

  const liqFactor = (100 / leverage) * 0.9;
  const estLiqPrice = positionSide === 'long'
    ? currentPrice * (1 - liqFactor / 100)
    : currentPrice * (1 + liqFactor / 100);

  const handleOpenPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numMargin || numMargin <= 0) {
      setMsg('Please enter a valid margin amount.');
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    if (isDemoMode) {
      setIsConfirmModalOpen(true);
    } else {
      executeFuturesPositionInternal();
    }
  };

  const executeFuturesPositionInternal = async () => {
    setIsSubmitting(true);
    
    if (isDemoMode) {
      const res = await openFuturesPosition({
        pair: activeCoin.symbol,
        side: positionSide,
        leverage,
        marginMode,
        amountUsdt: numMargin,
        tpPrice: tpPrice ? parseFloat(tpPrice) : undefined,
        slPrice: slPrice ? parseFloat(slPrice) : undefined
      });

      setMsg(res.message);
      setIsSubmitting(false);
      setTimeout(() => setMsg(null), 3500);
      setIsConfirmModalOpen(false);
      return;
    }

    try {
      const res = await futuresApi.openPosition({
        market_symbol: activeCoin.symbol,
        side: positionSide.toUpperCase() as 'LONG' | 'SHORT',
        margin_mode: marginMode.toUpperCase() as 'ISOLATED' | 'CROSS',
        leverage,
        collateral_amount: numMargin
      });

      setMsg(res.message || 'Futures position opened successfully!');
      
      // FIX: Force frontend to fetch the new position from the database
      await fetchLiveWallets();
      await refreshLiveOrders();
      setRightTab('positions'); 
      
    } catch (err: any) {
      setMsg(err.message || 'Failed to open futures position.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMsg(null), 3500);
      setIsConfirmModalOpen(false);
    }
  };

  const handleClosePositionBackend = async (positionId: string | number) => {
    if (isDemoMode) {
      await closePosition(String(positionId));
      return;
    }

    try {
      const res = await futuresApi.closePosition(positionId);
      setMsg(res.message || 'Position closed successfully.');
      
      // FIX: Refresh the positions table to remove it immediately
      await fetchLiveWallets();
      await refreshLiveOrders();
    } catch (err: any) {
      setMsg(err.message || 'Failed to close position.');
    } finally {
      setTimeout(() => setMsg(null), 3500);
    }
  };

  const handleUpdateLeverageBackend = async (newLev: number) => {
    setLeverage(newLev);
    setIsLeverageModalOpen(false);

    if (!isDemoMode) {
      try {
        const res = await futuresApi.updateLeverage(activeCoin.symbol, newLev);
        setMsg(res.message || `Leverage set to ${newLev}x`);
        
        // Refresh to get updated Liquidation Price from backend
        await refreshLiveOrders();
      } catch (err: any) {
        setMsg('Failed to update leverage on server.');
      } finally {
        setTimeout(() => setMsg(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <TradeConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeFuturesPositionInternal}
        tradeDetails={{
          pair: activeCoin.symbol,
          type: `${leverage}x Futures`,
          side: positionSide,
          amount: `${marginAmount} USDT Margin`,
          leverage
        }}
      />

      <div className="p-3.5 sm:p-4 rounded-2xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
          <div className="relative shrink-0">
            <select
              value={activeCoin.symbol}
              onChange={(e) => setActiveCoinSymbol(e.target.value)}
              className="appearance-none bg-app-sec font-black text-xs sm:text-sm text-app pr-7 pl-3 py-2 rounded-xl border border-app focus:outline-none focus:border-accent cursor-pointer"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.symbol}>
                  {coin.symbol} Perp
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-app-sec absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="text-right sm:text-left">
            <div className="text-base sm:text-lg font-black text-app font-mono">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}
            </div>
            <span className={`text-[11px] font-bold ${activeCoin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
              {activeCoin.change24h >= 0 ? '+' : ''}{activeCoin.change24h}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs border-t sm:border-t-0 border-app/60 pt-2 sm:pt-0">
          <div className="p-2 rounded-xl bg-app-sec border border-app flex-1 sm:flex-initial">
            <span className="text-app-sec block text-[10px]">Funding / Countdown</span>
            <span className="font-bold text-emerald-500 text-[11px] sm:text-xs">
              {((activeCoin.fundingRate || 0.01) * 100).toFixed(4)}% in {activeCoin.nextFundingIn || '03:45:12'}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-app-sec block text-[10px]">Open Interest</span>
            <span className="font-bold text-app">${((activeCoin.openInterest || 2800000000) / 1e9).toFixed(2)}B</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-app-card border border-app rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          {msg && (
            <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="break-words">{msg}</span>
              <button onClick={() => setMsg(null)} className="shrink-0 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMarginMode(marginMode === 'cross' ? 'isolated' : 'cross')}
              disabled={isSubmitting}
              className="py-3 px-3 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-extrabold text-xs border border-app transition-colors uppercase min-h-[44px] disabled:opacity-50"
            >
              {marginMode} Margin
            </button>

            <button
              onClick={() => {
                setTempLeverage(leverage);
                setIsLeverageModalOpen(true);
              }}
              disabled={isSubmitting}
              className="py-3 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold text-xs border border-red-500/20 transition-colors flex items-center justify-center gap-1 min-h-[44px] disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{leverage}x Leverage</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPositionSide('long')}
              disabled={isSubmitting}
              className={`py-3 rounded-xl font-black text-xs transition-all min-h-[44px] disabled:opacity-50 ${
                positionSide === 'long'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              OPEN LONG
            </button>
            <button
              onClick={() => setPositionSide('short')}
              disabled={isSubmitting}
              className={`py-3 rounded-xl font-black text-xs transition-all min-h-[44px] disabled:opacity-50 ${
                positionSide === 'short'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              OPEN SHORT
            </button>
          </div>

          <form onSubmit={handleOpenPosition} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-app-sec">Margin Amount (USDT)</label>
                <span className="text-[10px] text-app-sec font-mono">Avail: <strong className="text-emerald-500">${activeAvailableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
              </div>
              <input
                type="number"
                value={marginAmount}
                onChange={(e) => setMarginAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-accent min-h-[44px] disabled:opacity-50 font-mono"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setMarginAmount(((activeAvailableBalance * pct) / 100).toFixed(0))}
                  className="py-2 text-[11px] font-bold rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app min-h-[38px] disabled:opacity-50"
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-app-sec mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  placeholder="Optional TP"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app focus:outline-none min-h-[40px] disabled:opacity-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-app-sec mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  placeholder="Optional SL"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs text-app focus:outline-none min-h-[40px] disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-app-sec/60 border border-app space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-app-sec">Notional Value:</span>
                <span className="font-bold text-app font-mono">${notionalValue.toLocaleString()} USDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-sec">Position Size:</span>
                <span className="font-bold text-app font-mono">{positionSize.toFixed(4)} {activeCoin.symbol.split('/')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-sec">Est. Liq. Price:</span>
                <span className="font-bold text-negative font-mono">${estLiqPrice.toFixed(prec)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-black text-xs text-white shadow-lg transition-all min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50 ${
                positionSide === 'long'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>EXECUTING...</span>
                </>
              ) : (
                <span>EXECUTE {leverage}X {positionSide.toUpperCase()} POSITION</span>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-app-card border border-app rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-app pb-3 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightTab('chart')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    rightTab === 'chart' ? 'bg-accent text-white shadow-xs' : 'text-app-sec hover:text-app bg-app-sec'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Interactive Chart</span>
                </button>
                <button
                  onClick={() => setRightTab('positions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    rightTab === 'positions' ? 'bg-accent text-white shadow-xs' : 'text-app-sec hover:text-app bg-app-sec'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Open Positions ({positions.length})</span>
                </button>
              </div>
              <span className="text-[10px] sm:text-xs text-app-sec font-mono">{activeCoin.symbol} ${currentPrice.toLocaleString()}</span>
            </div>

            {rightTab === 'chart' ? (
              <TradingChart height={380} />
            ) : positions.length === 0 ? (
              <div className="text-center py-12 text-app-sec">
                <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No active futures positions open.</p>
              </div>
            ) : (
              <>
                <div className="block md:hidden space-y-3">
                  {positions.map((pos) => (
                    <div 
                      key={pos.id} 
                      className="p-4 rounded-2xl bg-app-sec/40 border border-app/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-app/60">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                            pos.side === 'long' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/15 text-red-500 border border-red-500/20'
                          }`}>
                            {pos.side} {pos.leverage}x
                          </span>
                          <span className="font-extrabold text-sm text-app">{pos.pair}</span>
                          <span className="text-[10px] text-app-sec font-semibold uppercase bg-app-card px-1.5 py-0.5 rounded border border-app">
                            {pos.marginMode}
                          </span>
                        </div>

                        <span className={`text-xs font-black font-mono ${pos.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.roe >= 0 ? '+' : ''}{pos.roe}%)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-app-card border border-app">
                          <span className="text-[10px] text-app-sec block">Position Size</span>
                          <span className="font-bold text-app font-mono">{pos.size} {pos.pair.split('/')[0]}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-app-card border border-app">
                          <span className="text-[10px] text-app-sec block">Margin</span>
                          <span className="font-bold text-app font-mono">${pos.margin.toFixed(2)} USDT</span>
                        </div>

                        <div className="p-2 rounded-xl bg-app-card border border-app">
                          <span className="text-[10px] text-app-sec block">Entry Price</span>
                          <span className="font-bold text-app font-mono">${pos.entryPrice.toFixed(2)}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-app-card border border-app">
                          <span className="text-[10px] text-app-sec block">Mark Price</span>
                          <span className="font-bold text-app font-mono">${pos.markPrice.toFixed(2)}</span>
                        </div>

                        <div className="col-span-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                          <span className="text-[10px] text-red-400 font-bold">Liquidation Price</span>
                          <span className="font-extrabold text-negative font-mono">${pos.liquidationPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => reversePosition(pos.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-app-card hover:bg-app-sec text-app border border-app text-xs font-bold flex items-center justify-center gap-1.5 min-h-[40px]"
                        >
                          <RefreshCcw className="w-3.5 h-3.5 text-accent" />
                          <span>Reverse Position</span>
                        </button>

                        <button
                          onClick={() => handleClosePositionBackend(pos.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 min-h-[40px] flex items-center justify-center"
                        >
                          <span>Market Close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                        <th className="py-2">Pair / Side</th>
                        <th className="py-2">Size / Margin</th>
                        <th className="py-2">Entry Price</th>
                        <th className="py-2">Mark Price</th>
                        <th className="py-2">Liq. Price</th>
                        <th className="py-2 text-right">Unrealized PnL (ROE)</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app text-xs font-medium">
                      {positions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-app-sec/40 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                                pos.side === 'long' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                              }`}>
                                {pos.side} {pos.leverage}x
                              </span>
                              <span className="font-bold text-app">{pos.pair}</span>
                            </div>
                            <span className="text-[10px] text-app-sec uppercase">{pos.marginMode}</span>
                          </td>
                          <td className="py-3">
                            <div className="font-bold text-app font-mono">{pos.size} {pos.pair.split('/')[0]}</div>
                            <span className="text-[10px] text-app-sec font-mono">${pos.margin.toFixed(2)} USDT</span>
                          </td>
                          <td className="py-3 text-app font-mono">${pos.entryPrice.toFixed(2)}</td>
                          <td className="py-3 text-app font-bold font-mono">${pos.markPrice.toFixed(2)}</td>
                          <td className="py-3 text-negative font-bold font-mono">${pos.liquidationPrice.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <div className={`font-extrabold font-mono ${pos.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                            </div>
                            <span className={`text-[10px] font-bold ${pos.roe >= 0 ? 'text-positive' : 'text-negative'}`}>
                              ({pos.roe >= 0 ? '+' : ''}{pos.roe}%)
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => reversePosition(pos.id)}
                                title="1-Click Reverse Position"
                                className="p-1.5 rounded-lg bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleClosePositionBackend(pos.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm"
                              >
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLeverageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-app-card border border-app rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-app">Adjust Position Leverage</h3>
              <button onClick={() => setIsLeverageModalOpen(false)}>
                <X className="w-4 h-4 text-app-sec" />
              </button>
            </div>

            <div className="text-center py-4">
              <span className="text-4xl font-black text-red-500">{tempLeverage}x</span>
              <p className="text-xs text-app-sec mt-1">High leverage increases liquidation risk.</p>
            </div>

            <input
              type="range"
              min={1}
              max={125}
              value={tempLeverage}
              onChange={(e) => setTempLeverage(parseInt(e.target.value))}
              className="w-full accent-red-500"
            />

            <div className="flex items-center justify-between text-xs text-app-sec font-mono">
              <span>1x</span>
              <span>25x</span>
              <span>50x</span>
              <span>100x</span>
              <span>125x</span>
            </div>

            <button
              onClick={() => handleUpdateLeverageBackend(tempLeverage)}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs shadow-md min-h-[44px]"
            >
              Confirm {tempLeverage}x Leverage
            </button>
          </div>
        </div>
      )}

    </div>
  );
};