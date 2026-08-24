import React, { useState, useEffect } from 'react';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';
import { 
  ChevronDown, 
  X,
  RefreshCw
} from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useUser } from '../../contexts/UserContext';
import { OrderSide, OrderType } from '../../types';
import { TradingChart } from '../trading/TradingChart';
import { TradeConfirmationModal } from '../layout/TradeConfirmationModal';
import { tradingApi } from '../../api/trading';

export const SpotTradingView: React.FC = () => {
  const { 
    coins, 
    activeCoin, 
    setActiveCoinSymbol, 
    orderBookBids, 
    orderBookAsks, 
    openOrders, 
    orderHistory, 
    placeOrder, 
    cancelOrder,
    refreshLiveOrders
  } = useTrading();

  const { isDemoMode, demoBalance } = useDemoMode();
  const { fetchLiveWallets } = useUser();

  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.01');
  const [activeBottomTab, setActiveBottomTab] = useState<'open' | 'history'>('open');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  useOverlayRegistration('spot-confirm-modal', isConfirmModalOpen, () => setIsConfirmModalOpen(false));

  // Auto-set the limit price slightly below/above market so it's never 0
  useEffect(() => {
    if (activeCoin && (!limitPrice || limitPrice === '0' || limitPrice === '')) {
      setLimitPrice((activeCoin.price * 0.995).toFixed(activeCoin.precision));
    }
  }, [activeCoin, limitPrice]);

  if (!activeCoin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-app-sec space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm font-bold tracking-wider uppercase">Syncing Live Market Data...</p>
      </div>
    );
  }

  const prec = activeCoin.precision;
  const currentPrice = activeCoin.price;
  const execPrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const totalValue = execPrice * (parseFloat(amount) || 0);

  const handlePercentageSelect = (percent: number) => {
    if (orderSide === 'buy') {
      const usdtAlloc = (demoBalance * percent) / 100;
      const coinAmt = usdtAlloc / execPrice;
      setAmount(coinAmt.toFixed(4));
    } else {
      setAmount((1.0 * (percent / 100)).toFixed(4));
    }
  };

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      setNotificationMsg('Please enter a valid order amount.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    if (isDemoMode) {
      setIsConfirmModalOpen(true);
    } else {
      executeOrderInternal();
    }
  };

  const executeOrderInternal = async () => {
    const numAmount = parseFloat(amount);
    const numPrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
    
    setIsSubmitting(true);

    if (isDemoMode) {
      const res = await placeOrder({
        pair: activeCoin.symbol,
        side: orderSide,
        type: orderType,
        price: numPrice,
        amount: numAmount
      });

      setNotificationMsg(res.message);
      setIsSubmitting(false);
      setTimeout(() => setNotificationMsg(null), 3500);
      setIsConfirmModalOpen(false);
      return;
    }

    try {
      const res = await tradingApi.placeOrder({
        market_symbol: activeCoin.symbol,
        type: orderType.toUpperCase() as 'MARKET' | 'LIMIT',
        side: orderSide.toUpperCase() as 'BUY' | 'SELL',
        amount: numAmount,
        price: orderType === 'market' ? undefined : numPrice
      });

      setNotificationMsg(res.message || 'Order placed successfully!');
      
      // Refresh DB data and switch tabs to display it
      await fetchLiveWallets();
      await refreshLiveOrders();
      setActiveBottomTab(orderType === 'market' ? 'history' : 'open');

    } catch (err: any) {
      setNotificationMsg(err.message || 'Failed to execute order.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotificationMsg(null), 3500);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <TradeConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeOrderInternal}
        tradeDetails={{
          pair: activeCoin.symbol,
          type: orderType,
          side: orderSide,
          amount: `${amount} ${activeCoin.symbol.split('/')[0]}`,
          price: execPrice.toFixed(2)
        }}
      />

      <div className="p-3.5 sm:p-4 rounded-2xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
          <div className="relative shrink-0">
            <select
              value={activeCoin.symbol}
              onChange={(e) => {
                setActiveCoinSymbol(e.target.value);
                setLimitPrice(coins.find((c) => c.symbol === e.target.value)?.price.toString() || '100');
              }}
              className="appearance-none bg-app-sec font-black text-xs sm:text-sm text-app pr-7 pl-3 py-2 rounded-xl border border-app focus:outline-none focus:border-accent cursor-pointer"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.symbol}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-app-sec absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="text-right sm:text-left">
            <div className="text-base sm:text-lg font-black text-app font-mono">
              ${activeCoin.price.toLocaleString(undefined, { minimumFractionDigits: prec, maximumFractionDigits: prec })}
            </div>
            <span className={`text-[11px] font-bold ${activeCoin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
              {activeCoin.change24h >= 0 ? '+' : ''}{activeCoin.change24h}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs overflow-x-auto no-scrollbar border-t sm:border-t-0 border-app/60 pt-2 sm:pt-0">
          <div className="shrink-0">
            <span className="text-app-sec block text-[10px]">24h High</span>
            <span className="font-bold text-app font-mono">${activeCoin.high24h.toLocaleString()}</span>
          </div>
          <div className="shrink-0">
            <span className="text-app-sec block text-[10px]">24h Low</span>
            <span className="font-bold text-app font-mono">${activeCoin.low24h.toLocaleString()}</span>
          </div>
          <div className="shrink-0">
            <span className="text-app-sec block text-[10px]">24h Volume</span>
            <span className="font-bold text-app font-mono">${(activeCoin.volume24h / 1e6).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-app-card border border-app rounded-2xl p-4 flex flex-col justify-between min-h-[500px] shadow-sm">
          {/* Injecting the new Live TradingView widget with slightly more height */}
          <TradingChart height={460} />
        </div>

        <div className="lg:col-span-4 bg-app-card border border-app rounded-2xl p-3 flex flex-col justify-between shadow-sm min-h-[360px]">
          <div className="flex items-center justify-between border-b border-app pb-2 mb-2">
            <span className="text-xs font-bold text-app">Order Book</span>
            <span className="text-[10px] text-app-sec">Spread: 0.01%</span>
          </div>

          <div className="space-y-1 text-xs">
            {orderBookAsks.slice(0, 5).map((row, idx) => (
              <div key={idx} className="relative flex items-center justify-between py-0.5 px-1 font-mono">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/10 rounded-sm pointer-events-none"
                  style={{ width: `${row.depthPercent}%` }}
                />
                <span className="text-negative font-bold z-10">${row.price.toFixed(prec)}</span>
                <span className="text-app-sec z-10">{row.size.toFixed(3)}</span>
              </div>
            ))}
          </div>

          <div className="my-2 py-1.5 px-3 rounded-xl bg-app-sec text-center font-extrabold text-sm text-app flex items-center justify-between">
            <span className="font-mono">${currentPrice.toFixed(prec)}</span>
            <span className={`text-xs ${activeCoin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
              {activeCoin.change24h >= 0 ? '▲' : '▼'}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            {orderBookBids.slice(0, 5).map((row, idx) => (
              <div key={idx} className="relative flex items-center justify-between py-0.5 px-1 font-mono">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-sm pointer-events-none"
                  style={{ width: `${row.depthPercent}%` }}
                />
                <span className="text-positive font-bold z-10">${row.price.toFixed(prec)}</span>
                <span className="text-app-sec z-10">{row.size.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-app-card border border-app rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        {notificationMsg && (
          <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="break-words">{notificationMsg}</span>
            <button onClick={() => setNotificationMsg(null)} className="shrink-0 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app pb-4">
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={() => setOrderSide('buy')}
              className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all min-h-[44px] ${
                orderSide === 'buy' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              BUY / LONG
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all min-h-[44px] ${
                orderSide === 'sell' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          <div className="flex items-center gap-1 bg-app-sec p-1 rounded-xl border border-app">
            <button
              onClick={() => setOrderType('limit')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                orderType === 'limit' ? 'bg-app-card text-app font-bold shadow-xs' : 'text-app-sec'
              }`}
            >
              Limit Order
            </button>
            <button
              onClick={() => setOrderType('market')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                orderType === 'market' ? 'bg-app-card text-app font-bold shadow-xs' : 'text-app-sec'
              }`}
            >
              Market Order
            </button>
          </div>
        </div>

        <form onSubmit={handleExecuteOrder} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Order Price (USDT)</label>
            <input
              type="number"
              step="any"
              disabled={orderType === 'market' || isSubmitting}
              value={orderType === 'market' ? currentPrice.toFixed(prec) : limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-accent disabled:opacity-60 min-h-[44px] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">
              Amount ({activeCoin.symbol.split('/')[0]})
            </label>
            <input
              type="number"
              step="any"
              disabled={isSubmitting}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-app-sec border border-app rounded-xl px-3 py-2.5 text-xs font-bold text-app focus:outline-none focus:border-accent min-h-[44px] font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-app-sec mb-1">Allocation %</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePercentageSelect(pct)}
                  className="py-2.5 text-[11px] font-bold rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app min-h-[44px] disabled:opacity-50"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-app mt-2">
            <div className="text-xs text-app-sec space-y-0.5">
              <div>Est. Order Value: <strong className="text-app font-mono">${totalValue.toFixed(2)} USDT</strong></div>
              <div className="text-[10px] opacity-80">
                Fee: 0.05% • Available Demo Balance: ${(demoBalance / 1000).toFixed(1)}k USDT
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs text-white shadow-lg transition-all min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50 ${
                orderSide === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <span>{orderSide === 'buy' ? 'PLACE BUY ORDER' : 'PLACE SELL ORDER'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-app-card border border-app rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4 border-b border-app pb-3 mb-3">
          <button
            onClick={() => setActiveBottomTab('open')}
            className={`text-xs font-bold pb-1 transition-colors relative ${
              activeBottomTab === 'open' ? 'text-accent' : 'text-app-sec'
            }`}
          >
            Open Orders ({openOrders.length})
            {activeBottomTab === 'open' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
          <button
            onClick={() => setActiveBottomTab('history')}
            className={`text-xs font-bold pb-1 transition-colors relative ${
              activeBottomTab === 'history' ? 'text-accent' : 'text-app-sec'
            }`}
          >
            Order History ({orderHistory.length})
            {activeBottomTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
        </div>

        <div>
          {activeBottomTab === 'open' ? (
            openOrders.length === 0 ? (
              <p className="text-center py-8 text-xs text-app-sec">No active open orders.</p>
            ) : (
              <>
                <div className="block md:hidden space-y-3">
                  {openOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 rounded-2xl bg-app-sec/30 border border-app space-y-2">
                      <div className="flex items-center justify-between border-b border-app/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                            ord.side === 'buy' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                          }`}>
                            {ord.side}
                          </span>
                          <span className="font-extrabold text-xs text-app">{ord.pair}</span>
                          <span className="text-[10px] text-app-sec uppercase">{ord.type}</span>
                        </div>
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-app-sec block">Price</span>
                          <span className="font-bold text-app font-mono">${ord.price.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-app-sec block">Amount</span>
                          <span className="font-bold text-app font-mono">{ord.amount}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-app-sec block">Total Value</span>
                          <span className="font-bold text-app font-mono">${ord.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                        <th className="py-2">Pair</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Side</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Total</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app text-xs font-medium">
                      {openOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-2.5 font-bold text-app">{ord.pair}</td>
                          <td className="py-2.5 text-app-sec uppercase">{ord.type}</td>
                          <td className={`py-2.5 font-bold uppercase ${ord.side === 'buy' ? 'text-positive' : 'text-negative'}`}>
                            {ord.side}
                          </td>
                          <td className="py-2.5 text-app font-mono">${ord.price.toFixed(2)}</td>
                          <td className="py-2.5 text-app font-mono">{ord.amount}</td>
                          <td className="py-2.5 text-app font-mono">${ord.total.toFixed(2)}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => cancelOrder(ord.id)}
                              className="px-2.5 py-1 text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : (
            <>
              <div className="block md:hidden space-y-3">
                {orderHistory.map((ord) => (
                  <div key={ord.id} className="p-3.5 rounded-2xl bg-app-sec/20 border border-app space-y-2">
                    <div className="flex items-center justify-between border-b border-app/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                          ord.side === 'buy' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                        }`}>
                          {ord.side}
                        </span>
                        <span className="font-extrabold text-xs text-app">{ord.pair}</span>
                        <span className="text-[10px] text-app-sec uppercase">{ord.type}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded">
                        {ord.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-app-sec block">Execution Price</span>
                        <span className="font-bold text-app font-mono">${ord.price.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-app-sec block">Filled Amount</span>
                        <span className="font-bold text-app font-mono">{ord.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-app text-[10px] font-bold text-app-sec uppercase">
                      <th className="py-2">Pair</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Side</th>
                      <th className="py-2">Price</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app text-xs font-medium">
                    {orderHistory.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-2.5 font-bold text-app">{ord.pair}</td>
                        <td className="py-2.5 text-app-sec uppercase">{ord.type}</td>
                        <td className={`py-2.5 font-bold uppercase ${ord.side === 'buy' ? 'text-positive' : 'text-negative'}`}>
                          {ord.side}
                        </td>
                        <td className="py-2.5 text-app font-mono">${ord.price.toFixed(2)}</td>
                        <td className="py-2.5 text-app font-mono">{ord.amount}</td>
                        <td className="py-2.5 font-bold text-emerald-500 uppercase">{ord.status}</td>
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
  );
};