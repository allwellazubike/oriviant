import React from 'react';

interface AssetIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AssetIcon: React.FC<AssetIconProps> = ({ symbol, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const cleanSym = symbol.toUpperCase().replace('/USDT', '').replace('/USD', '').trim();

  // Return SVG icon badges for official crypto/asset logos
  const renderSvg = () => {
    switch (cleanSym) {
      case 'BTC':
      case 'BITCOIN':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-inner">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.534.36 9.105 1.962 2.67 8.475-1.243 14.9.36c6.43 1.605 10.342 8.117 8.738 14.544zm-6.355-3.328c.285-1.91-1.168-2.937-3.159-3.623l.646-2.588-1.575-.392-.63 2.525c-.414-.103-.84-.2-1.263-.298l.635-2.548-1.574-.393-.646 2.587c-.342-.078-.678-.155-1.005-.235l.002-.01-2.172-.543-.419 1.682s1.169.268 1.144.285c.638.16.754.583.734.919l-.736 2.95c.044.01.101.026.164.05l-.168-.042-.103 4.138c-.083.207-.294.517-.768.4l-1.145-.286-.587 1.354 2.05.511c.38.096.753.197 1.12.292l-.654 2.628 1.572.392.647-2.593c.43.117.848.225 1.257.327l-.645 2.592 1.575.392.654-2.62c2.686.509 4.706.304 5.558-2.126.687-1.956-.034-3.085-1.45-3.818 1.032-.238 1.81-.917 2.019-2.32z" />
            </svg>
          </div>
        );
      case 'ETH':
      case 'ETHEREUM':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-700 via-purple-600 to-slate-400 flex items-center justify-center text-white shadow-inner">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35zm.056-17.97L4.56 12.235l7.44 4.399 7.44-4.399L12 0z" />
            </svg>
          </div>
        );
      case 'SOL':
      case 'SOLANA':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-400 via-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5">
              <path d="M4.5 17.5h15l-3 3.5h-15l3-3.5zm0-11h15l-3 3.5h-15l3-3.5zm15 5.5h-15l3 3.5h15l-3-3.5z" />
            </svg>
          </div>
        );
      case 'ADA':
      case 'CARDANO':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ₳
          </div>
        );
      case 'AVAX':
      case 'AVALANCHE':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ▲
          </div>
        );
      case 'LINK':
      case 'CHAINLINK':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ⬡
          </div>
        );
      case 'LTC':
      case 'LITECOIN':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
            Ł
          </div>
        );
      case 'USDT':
      case 'TETHER':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ₮
          </div>
        );
      case 'USDC':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-inner">
            $
          </div>
        );
      case 'TRX':
      case 'TRON':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ⚡
          </div>
        );
      case 'XLM':
      case 'STELLAR':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-cyan-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
            🚀
          </div>
        );
      case 'DOT':
      case 'POLKADOT':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
            ●
          </div>
        );
      case 'DOGE':
      case 'DOGECOIN':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-amber-950 font-black text-xs shadow-inner">
            Ð
          </div>
        );
      case 'BNB':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-inner">
            ❖
          </div>
        );
      case 'XRP':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-black border border-slate-700 flex items-center justify-center text-cyan-400 font-black shadow-inner">
            ✕
          </div>
        );
      case 'GRAM':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-cyan-300 flex items-center justify-center text-white font-black shadow-inner">
            ◆
          </div>
        );
      case 'XAU':
      case 'GOLD':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 flex items-center justify-center text-amber-950 font-black text-xs shadow-inner">
            Au
          </div>
        );
      case 'XAG':
      case 'SILVER':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 flex items-center justify-center text-slate-900 font-black text-xs shadow-inner">
            Ag
          </div>
        );
      case 'EUR':
      case 'FOREX':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            €
          </div>
        );
      case 'GBP':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-800 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            £
          </div>
        );
      case 'AAPL':
      case 'STOCKS':
      case 'US STOCKS':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
            🍎
          </div>
        );
      case 'NVDA':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-slate-950 text-xs font-black shadow-inner">
            NV
          </div>
        );
      case 'TSLA':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white text-xs font-black shadow-inner">
            T
          </div>
        );
      case 'NDX':
      case 'NASDAQ':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
            NDX
          </div>
        );
      case 'SPX':
      case 'S&P500':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-800 to-indigo-900 flex items-center justify-center text-amber-400 text-[10px] font-black shadow-inner">
            500
          </div>
        );
      case 'OIL':
      case 'USOIL':
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-stone-800 to-black border border-stone-700 flex items-center justify-center text-amber-500 text-xs font-bold shadow-inner">
            🛢️
          </div>
        );
      default:
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {cleanSym.substring(0, 3)}
          </div>
        );
    }
  };

  return (
    <div className={`shrink-0 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {renderSvg()}
    </div>
  );
};
