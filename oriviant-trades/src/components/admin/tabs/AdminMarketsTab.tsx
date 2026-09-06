import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Plus, Settings2, AlertTriangle, CheckCircle2, X, Percent, 
  Zap, Sliders, Activity, Layers, Edit, Trash2, Star, Sparkles, Flame, 
  Globe, DollarSign, Eye, RefreshCw
} from 'lucide-react';
import { marketsApi } from '../../../api/markets';

export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  category: 'Crypto' | 'Forex' | 'Stocks' | 'ETFs' | 'Indices' | 'Metals' | 'Energy' | 'Commodities';
  logoUrl?: string;
  description: string;
  status: 'Active' | 'Maintenance' | 'Suspended' | 'Delisted';
  spotAvailable: boolean;
  futuresAvailable: boolean;
  copyTradingAvailable: boolean;
  demoAvailable: boolean;
  minOrder: number;
  maxOrder: number;
  tradingFee: string;
  leverageLimits: string;
  pricePrecision: number;
  qtyPrecision: number;
  isFeatured: boolean;
  isTrending: boolean;
  isNewListing: boolean;
  volume24h: string;
  activeTraders: number;
  openPositions: number;
  buyOrdersCount: number;
  sellOrdersCount: number;
  popularityScore: number;
  price: string;
}

export const AdminMarketsTab: React.FC = () => {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MarketAsset | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formCategory, setFormCategory] = useState<MarketAsset['category']>('Crypto');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<MarketAsset['status']>('Active');
  const [formSpot, setFormSpot] = useState(true);
  const [formFutures, setFormFutures] = useState(true);
  const [formCopy, setFormCopy] = useState(true);
  const [formDemo, setFormDemo] = useState(true);
  const [formMinOrder, setFormMinOrder] = useState(10);
  const [formMaxOrder, setFormMaxOrder] = useState(500000);
  const [formFee, setFormFee] = useState('0.02%');
  const [formLeverage, setFormLeverage] = useState('50x');
  const [formPricePrec, setFormPricePrec] = useState(2);
  const [formQtyPrec, setFormQtyPrec] = useState(4);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formIsNewListing, setFormIsNewListing] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchMarkets = async () => {
    setIsLoading(true);
    try {
      const res = await marketsApi.getMarkets();
      if (res.success && res.data) {
        const mapped: MarketAsset[] = res.data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          symbol: d.symbol,
          category: d.category,
          description: d.description || '',
          status: d.status,
          spotAvailable: d.spot_available,
          futuresAvailable: d.futures_available,
          copyTradingAvailable: d.copy_trading_available,
          demoAvailable: d.demo_available,
          minOrder: Number(d.min_order),
          maxOrder: Number(d.max_order),
          tradingFee: d.trading_fee,
          leverageLimits: d.leverage_limits,
          pricePrecision: d.price_precision,
          qtyPrecision: d.qty_precision,
          isFeatured: d.is_featured,
          isTrending: d.is_trending,
          isNewListing: d.is_new_listing,
          // Live price feeds will stream via websockets, setting 0s to prep the engine
          volume24h: '$0.00',
          activeTraders: 0,
          openPositions: 0,
          buyOrdersCount: 0,
          sellOrdersCount: 0,
          popularityScore: 50,
          price: '0.00'
        }));
        setAssets(mapped);
      }
    } catch (error) {
      console.error('Failed to load markets:', error);
      showToast('Error loading live market data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setFormName('');
    setFormSymbol('');
    setFormCategory('Crypto');
    setFormLogoUrl('');
    setFormDescription('');
    setFormStatus('Active');
    setFormSpot(true);
    setFormFutures(true);
    setFormCopy(true);
    setFormDemo(true);
    setFormMinOrder(10);
    setFormMaxOrder(500000);
    setFormFee('0.02%');
    setFormLeverage('50x');
    setFormPricePrec(2);
    setFormQtyPrec(4);
    setFormIsFeatured(false);
    setFormIsTrending(false);
    setFormIsNewListing(true);
    setIsAssetModalOpen(true);
  };

  const handleOpenEditModal = (asset: MarketAsset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormSymbol(asset.symbol);
    setFormCategory(asset.category);
    setFormLogoUrl(asset.logoUrl || '');
    setFormDescription(asset.description);
    setFormStatus(asset.status);
    setFormSpot(asset.spotAvailable);
    setFormFutures(asset.futuresAvailable);
    setFormCopy(asset.copyTradingAvailable);
    setFormDemo(asset.demoAvailable);
    setFormMinOrder(asset.minOrder);
    setFormMaxOrder(asset.maxOrder);
    setFormFee(asset.tradingFee);
    setFormLeverage(asset.leverageLimits);
    setFormPricePrec(asset.pricePrecision);
    setFormQtyPrec(asset.qtyPrecision);
    setFormIsFeatured(asset.isFeatured);
    setFormIsTrending(asset.isTrending);
    setFormIsNewListing(asset.isNewListing);
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSymbol) return;

    const payload = {
      name: formName, symbol: formSymbol, category: formCategory, description: formDescription,
      status: formStatus, spotAvailable: formSpot, futuresAvailable: formFutures,
      copyTradingAvailable: formCopy, demoAvailable: formDemo, minOrder: formMinOrder,
      maxOrder: formMaxOrder, tradingFee: formFee, leverageLimits: formLeverage,
      pricePrecision: formPricePrec, qtyPrecision: formQtyPrec, isFeatured: formIsFeatured,
      isTrending: formIsTrending, isNewListing: formIsNewListing
    };

    try {
      if (editingAsset) {
        await marketsApi.updateMarket(editingAsset.id, payload);
        showToast(`Asset parameters for ${formSymbol} updated successfully.`);
      } else {
        await marketsApi.createMarket(payload);
        showToast(`Successfully listed new market asset ${formSymbol}!`);
      }
      await fetchMarkets();
      setIsAssetModalOpen(false);
    } catch (error) {
      showToast('Error saving market asset to database.');
    }
  };

  const handleDeleteAsset = async (id: string, symbol: string) => {
    if (confirm(`Are you sure you want to permanently delete market asset ${symbol}?`)) {
      try {
        await marketsApi.deleteMarket(id);
        showToast(`Asset ${symbol} deleted.`);
        await fetchMarkets();
      } catch (error) {
        showToast('Failed to delete asset.');
      }
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: MarketAsset['status']) => {
    try {
      await marketsApi.updateMarketStatus(id, newStatus);
      showToast(`Market status changed to ${newStatus}`);
      await fetchMarkets();
    } catch (error) {
      showToast('Failed to update status.');
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Control Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Crypto', 'Forex', 'Stocks', 'ETFs', 'Indices', 'Metals', 'Energy', 'Commodities'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-app-sec text-app-sec hover:text-app'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Trading Asset</span>
        </button>

      </div>

      {/* Assets Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Multi-Asset Market Directory ({filteredAssets.length} Assets)</span>
          </h3>

          <div className="flex items-center gap-2">
            <button onClick={fetchMarkets} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors" title="Refresh Live Markets">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset name or symbol..."
              className="bg-app-sec border border-app rounded-xl px-3 py-1.5 text-xs text-app focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="py-10 text-center text-app-sec text-xs font-bold flex flex-col items-center justify-center gap-2">
               <RefreshCw className="w-5 h-5 animate-spin text-accent" />
               Querying Postgres Database...
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app text-[11px] font-extrabold text-app-sec uppercase tracking-wider">
                  <th className="pb-3 pl-2">Asset Name & Symbol</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Trading Channels</th>
                  <th className="pb-3">Price Feed</th>
                  <th className="pb-3">Badges</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/60 text-xs font-medium">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-app-sec/30 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs shrink-0">
                          {asset.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-extrabold text-app text-sm">{asset.symbol}</div>
                          <div className="text-[10px] text-app-sec">{asset.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-app-sec text-app-sec border border-app">
                        {asset.category}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        asset.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        asset.status === 'Suspended' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-app-sec text-app-sec border border-app'
                      }`}>
                        {asset.status}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {asset.spotAvailable && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-500">Spot</span>}
                        {asset.futuresAvailable && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500">Futures ({asset.leverageLimits})</span>}
                        {asset.copyTradingAvailable && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500">Copy</span>}
                        {asset.demoAvailable && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/10 text-accent">Demo</span>}
                      </div>
                    </td>

                    <td className="py-3.5 font-mono">
                      <div className="font-bold text-app">{asset.price}</div>
                      <div className="text-[10px] text-emerald-500">Awaiting WS Feed</div>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-1">
                        {asset.isFeatured && <span className="p-1 rounded bg-amber-500/20 text-amber-500" title="Featured"><Star className="w-3 h-3 fill-amber-500" /></span>}
                        {asset.isTrending && <span className="p-1 rounded bg-red-500/20 text-red-500" title="Trending"><Flame className="w-3 h-3 fill-red-500" /></span>}
                        {asset.isNewListing && <span className="p-1 rounded bg-emerald-500/20 text-emerald-500" title="New Listing"><Sparkles className="w-3 h-3" /></span>}
                      </div>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(asset)}
                          className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app"
                          title="Edit Asset"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <select
                          value={asset.status}
                          onChange={(e) => handleQuickStatusChange(asset.id, e.target.value as any)}
                          className="bg-app-sec border border-app rounded-xl px-2 py-1 text-[11px] font-bold text-app focus:outline-none cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Delisted">Delisted</option>
                        </select>

                        <button
                          onClick={() => handleDeleteAsset(asset.id, asset.symbol)}
                          className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Asset Form Modal (Add or Edit) */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-amber-500" />
                <span>{editingAsset ? `Edit Asset: ${editingAsset.symbol}` : 'Add New Market Trading Asset'}</span>
              </h3>
              <button onClick={() => setIsAssetModalOpen(false)} className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Asset Full Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Bitcoin or Solana"
                    required
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    placeholder="e.g. BTC/USDT or AAPL"
                    required
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Asset Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold cursor-pointer"
                  >
                    <option value="Crypto">Crypto</option>
                    <option value="Forex">Forex</option>
                    <option value="Stocks">Stocks</option>
                    <option value="ETFs">ETFs</option>
                    <option value="Indices">Indices</option>
                    <option value="Metals">Metals</option>
                    <option value="Energy">Energy</option>
                    <option value="Commodities">Commodities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Trading Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Delisted">Delisted</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Max Leverage Limits</label>
                  <input
                    type="text"
                    value={formLeverage}
                    onChange={(e) => setFormLeverage(e.target.value)}
                    placeholder="125x"
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2 text-xs text-app font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-app-sec mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Asset description and market details..."
                  rows={2}
                  className="w-full bg-app-sec border border-app rounded-xl p-2.5 text-xs text-app focus:outline-none"
                />
              </div>

              {/* Checkbox Capabilities */}
              <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                <span className="font-bold text-app block mb-1">Channel & Trading Availability</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-app">
                    <input type="checkbox" checked={formSpot} onChange={(e) => setFormSpot(e.target.checked)} />
                    <span>Spot Market</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-app">
                    <input type="checkbox" checked={formFutures} onChange={(e) => setFormFutures(e.target.checked)} />
                    <span>Futures Contract</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-app">
                    <input type="checkbox" checked={formCopy} onChange={(e) => setFormCopy(e.target.checked)} />
                    <span>Copy Trading</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-app">
                    <input type="checkbox" checked={formDemo} onChange={(e) => setFormDemo(e.target.checked)} />
                    <span>Demo Mode</span>
                  </label>
                </div>
              </div>

              {/* Order limits & Precisions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Min Order Size ($)</label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app"
                  />
                </div>
                <div>
                  <label className="block font-bold text-app-sec mb-1">Max Order Size ($)</label>
                  <input
                    type="number"
                    value={formMaxOrder}
                    onChange={(e) => setFormMaxOrder(Number(e.target.value))}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app"
                  />
                </div>
                <div>
                  <label className="block font-bold text-app-sec mb-1">Price Precision</label>
                  <input
                    type="number"
                    value={formPricePrec}
                    onChange={(e) => setFormPricePrec(Number(e.target.value))}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app"
                  />
                </div>
                <div>
                  <label className="block font-bold text-app-sec mb-1">Qty Precision</label>
                  <input
                    type="number"
                    value={formQtyPrec}
                    onChange={(e) => setFormQtyPrec(Number(e.target.value))}
                    className="w-full bg-app-sec border border-app rounded-xl px-3 py-2 text-xs font-bold text-app"
                  />
                </div>
              </div>

              {/* Feature Badges */}
              <div className="p-3.5 rounded-2xl bg-app-sec/40 border border-app space-y-2">
                <span className="font-bold text-app block mb-1">Featured Badges & Promos</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-500">
                    <input type="checkbox" checked={formIsFeatured} onChange={(e) => setFormIsFeatured(e.target.checked)} />
                    <span>Homepage Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-red-500">
                    <input type="checkbox" checked={formIsTrending} onChange={(e) => setFormIsTrending(e.target.checked)} />
                    <span>Trending Tag</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-500">
                    <input type="checkbox" checked={formIsNewListing} onChange={(e) => setFormIsNewListing(e.target.checked)} />
                    <span>New Listing Tag</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-app-sec text-app-sec hover:text-app font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-md"
                >
                  Save Asset Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};