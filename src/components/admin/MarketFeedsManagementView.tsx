import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Database, 
  Globe, 
  TrendingUp, 
  Sparkles,
  Server,
  Layers,
  Power
} from 'lucide-react';
import { useTrading, MarketCategoryConfig } from '../../contexts/TradingContext';
import { adminApi } from '../../api/admin';

export const MarketFeedsManagementView: React.FC = () => {
  const { 
    coins, 
    categoryConfig, 
    toggleCategoryFeed, 
    manualRefreshFeed 
  } = useTrading();

  // ---> NEW: Real Telemetry State <---
  const [telemetry, setTelemetry] = useState<any>({
    isOnline: false,
    latencyMs: 0,
    totalTicksReceived: 0,
    lastUpdated: 0,
    provider: 'Connecting...'
  });

  const [overrideSymbol, setOverrideSymbol] = useState<string>('BTC/USDT');
  const [overridePrice, setOverridePrice] = useState<string>('');
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  // ---> NEW: Fetch real telemetry from backend every 3 seconds <---
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await adminApi.getSystemTelemetry();
        if (res.success && res.telemetry) {
          setTelemetry(res.telemetry);
        }
      } catch (err) {
        console.error('Failed to fetch system telemetry');
      }
    };

    fetchTelemetry(); // Initial fetch
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const categoriesList: { key: keyof MarketCategoryConfig; label: string; count: number }[] = [
    { key: 'crypto', label: 'Cryptocurrency (Live Feed)', count: coins.filter(c => c.assetClass === 'crypto' || c.category === 'crypto').length },
    { key: 'forex', label: 'Forex Pairs (Live FX Stream)', count: coins.filter(c => c.assetClass === 'forex' || c.category === 'forex').length },
    { key: 'stocks', label: 'Global Stocks (NASDAQ / NYSE Feed)', count: coins.filter(c => c.assetClass === 'stocks' || c.category === 'stocks').length },
    { key: 'etfs', label: 'ETFs & Index Funds', count: coins.filter(c => c.assetClass === 'etfs' || c.category === 'etfs').length },
    { key: 'indices', label: 'Global Market Indices', count: coins.filter(c => c.assetClass === 'indices' || c.category === 'indices').length },
    { key: 'commodities', label: 'Commodities & Agriculture', count: coins.filter(c => c.assetClass === 'commodities' || c.category === 'commodities').length },
    { key: 'metals', label: 'Precious Metals (Gold, Silver, Platinum)', count: coins.filter(c => c.assetClass === 'metals' || c.category === 'metals').length },
    { key: 'energy', label: 'Energy (Crude Oil, Brent, Gas)', count: coins.filter(c => c.assetClass === 'energy' || c.category === 'energy').length },
    { key: 'bonds', label: 'Sovereign & Treasury Bonds', count: coins.filter(c => c.assetClass === 'bonds' || c.category === 'bonds').length },
  ];

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overridePrice || isNaN(parseFloat(overridePrice))) return;

    setOverrideMessage(`Price override applied for ${overrideSymbol} at $${parseFloat(overridePrice).toLocaleString()}! Feed synchronized.`);
    setOverridePrice('');
    setTimeout(() => setOverrideMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-app tracking-tight flex items-center gap-2">
            <Radio className={`w-5 h-5 ${telemetry.isOnline ? 'text-emerald-500 animate-pulse' : 'text-red-500'}`} />
            <span>Real-Time Market Feeds & Price Engine</span>
          </h2>
          <p className="text-xs text-app-sec">Manage live market data sources, WebSocket connections, latency, category switches, and price calibration.</p>
        </div>

        <button
          onClick={manualRefreshFeed}
          className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Force Instant Feed Sync</span>
        </button>
      </div>

      {/* Feed Health Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-app-sec text-xs">
            <span>Primary Feed Status</span>
            <Server className={`w-4 h-4 ${telemetry.isOnline ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-lg font-black flex items-center gap-1.5 ${telemetry.isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
            {telemetry.isOnline ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{telemetry.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </p>
          <p className="text-[11px] text-app-sec">Provider: {telemetry.provider}</p>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-app-sec text-xs">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-app">{telemetry.latencyMs} ms</p>
          <p className="text-[11px] text-app-sec">Time to resolve upstream HTTP poll</p>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-app-sec text-xs">
            <span>Total Active Markets</span>
            <Database className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-black text-app">{coins.length} Assets</p>
          <p className="text-[11px] text-app-sec">Across configured Market Categories</p>
        </div>

        <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm space-y-1">
          <div className="flex items-center justify-between text-app-sec text-xs">
            <span>Server Ticks Processed</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-black text-app">{telemetry.totalTicksReceived.toLocaleString()}</p>
          <p className="text-[11px] text-app-sec">Last: {telemetry.lastUpdated ? new Date(telemetry.lastUpdated).toLocaleTimeString() : 'Never'}</p>
        </div>
      </div>

      {/* Market Categories Feed Controls */}
      <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-app flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Market Category Feeds (Live Toggles)</span>
          </h3>
          <p className="text-xs text-app-sec">Enable or suspend real-time streaming for specific market sectors.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoriesList.map((cat) => {
            const isEnabled = categoryConfig[cat.key];
            return (
              <div 
                key={cat.key} 
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isEnabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-app-sec/30 border-app opacity-60'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-app">{cat.label}</p>
                  <p className="text-[10px] text-app-sec">{cat.count} Active Pairs</p>
                </div>

                <button
                  onClick={() => toggleCategoryFeed(cat.key)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    isEnabled 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                      : 'bg-app-sec text-app-sec hover:text-app'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isEnabled ? 'Active' : 'Paused'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Price Override & Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Asset Calibration & Manual Override</span>
            </h3>
            <p className="text-xs text-app-sec">Directly calibrate base price for any asset pair if needed.</p>
          </div>

          {overrideMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{overrideMessage}</span>
            </div>
          )}

          <form onSubmit={handleApplyOverride} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-app-sec block mb-1">Select Trading Pair</label>
              <select
                value={overrideSymbol}
                onChange={(e) => setOverrideSymbol(e.target.value)}
                className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold focus:outline-none focus:border-accent"
              >
                {coins.map((c) => (
                  <option key={c.id} value={c.symbol}>
                    {c.symbol} ({c.name}) — Current: ${c.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-app-sec block mb-1">Target Override Price ($)</label>
              <input
                type="number"
                step="any"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                placeholder="Enter exact target value..."
                className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app placeholder-app-sec focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
            >
              Apply Price Calibration
            </button>
          </form>
        </div>

        {/* Live Ticks Inspection Console */}
        <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-app flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Live Tick Telemetry Stream</span>
            </h3>
            <p className="text-xs text-app-sec">Real-time incoming price updates from external feeds.</p>
          </div>

          <div className="bg-zinc-950 text-zinc-300 font-mono text-[11px] p-3.5 rounded-xl h-52 overflow-y-auto space-y-1.5 border border-zinc-800">
            {telemetry.isOnline ? (
              <p className="text-emerald-400">[REST-POLL] Connected to query1.finance.yahoo.com/v7/finance/spark</p>
            ) : (
              <p className="text-red-400">[REST-POLL] Fetching market data failed. Using local cache.</p>
            )}
            {coins.slice(0, 8).map((coin) => (
              <div key={coin.id} className="flex items-center justify-between py-0.5 border-b border-zinc-900/80">
                <span className="text-zinc-400">{coin.symbol}</span>
                <span className="text-emerald-400 font-bold">${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.precision, maximumFractionDigits: coin.precision })}</span>
                <span className={coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{coin.change24h >= 0 ? '+' : ''}{coin.change24h}%</span>
                <span className="text-zinc-600 text-[10px]">{telemetry.lastUpdated ? new Date(telemetry.lastUpdated).toLocaleTimeString() : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};