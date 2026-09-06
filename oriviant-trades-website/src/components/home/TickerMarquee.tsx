import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../../types';

interface TickerMarqueeProps {
  onNavigate: (tab: NavigationTab) => void;
}

interface TickerData {
  pair: string;
  price: number;
  change: number;
  flash?: 'up' | 'down' | null;
}

const INITIAL_TICKERS: TickerData[] = [
  { pair: 'BTC/USDT', price: 94839.60, change: 2.39 },
  { pair: 'ETH/USDT', price: 3422.16, change: 1.61 },
  { pair: 'SOL/USDT', price: 188.69, change: 3.23 },
  { pair: 'DOGE/USDT', price: 0.3705, change: 0.56 },
  { pair: 'XAU/USD', price: 2748.90, change: 0.85 },
  { pair: 'EUR/USD', price: 1.0845, change: -0.12 },
  { pair: 'NASDAQ', price: 20412.30, change: 1.15 },
  { pair: 'S&P500', price: 5882.20, change: 0.78 },
  { pair: 'XRP/USDT', price: 1.1240, change: 5.80 },
  { pair: 'BNB/USDT', price: 620.40, change: 0.95 },
  { pair: 'ADA/USDT', price: 0.8420, change: 4.12 },
];

export const TickerMarquee: React.FC<TickerMarqueeProps> = ({ onNavigate }) => {
  const [tickers, setTickers] = useState<TickerData[]>(INITIAL_TICKERS);

  // Live market price updates simulation (Refreshes 1-2 pairs every 2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const item = { ...next[randomIndex] };

        // Small price movement between -0.12% and +0.12%
        const deltaPercent = (Math.random() * 0.24 - 0.12) / 100;
        const newPrice = item.price * (1 + deltaPercent);
        const flash: 'up' | 'down' = newPrice >= item.price ? 'up' : 'down';

        item.price = newPrice;
        item.change = item.change + (deltaPercent * 100);
        item.flash = flash;

        next[randomIndex] = item;
        return next;
      });

      // Clear flash after 800ms
      setTimeout(() => {
        setTickers((current) =>
          current.map((t) => (t.flash ? { ...t, flash: null } : t))
        );
      }, 800);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };

  // Duplicate list for seamless infinite horizontal marquee
  const marqueeList = [...tickers, ...tickers];

  return (
    <div className="w-full bg-app-sec border-b border-app py-2.5 overflow-hidden select-none cursor-pointer transition-colors duration-300">
      <div 
        onClick={() => onNavigate('markets')}
        className="flex w-max items-center gap-8 sm:gap-10 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]"
      >
        {marqueeList.map((item, idx) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={`${item.pair}-${idx}`}
              className={`flex items-center gap-2 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                item.flash === 'up'
                  ? 'text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded'
                  : item.flash === 'down'
                  ? 'text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded'
                  : 'text-app'
              }`}
            >
              {/* Trading Pair */}
              <span className="font-extrabold text-app tracking-wide">
                {item.pair}
              </span>

              {/* Current Price */}
              <span className="font-mono text-app font-bold">
                {formatPrice(item.price)}
              </span>

              {/* Arrow and Percentage Change */}
              <span
                className={`flex items-center gap-0.5 font-bold font-mono text-[11px] ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                <span className="text-[9px] leading-none">{isPositive ? '▲' : '▼'}</span>
                <span>{isPositive ? '+' : ''}{item.change.toFixed(2)}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

