import React, { useEffect, useRef, memo } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TradingChartProps {
  height?: number;
}

export const TradingChart: React.FC<TradingChartProps> = memo(({ height = 460 }) => {
  const { activeCoin } = useTrading();
  const { mode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !activeCoin) return;
    
    // Clean up previous widget injection to prevent duplicates
    containerRef.current.innerHTML = '';
    
    // Format symbol for TradingView's API
    // e.g., "BTC/USDT" -> "BINANCE:BTCUSDT" for crypto feeds
    // e.g., "SPY" -> "SPY" for standard stock tickers
    const formattedSymbol = activeCoin.symbol.includes('/') 
        ? `BINANCE:${activeCoin.symbol.replace('/', '')}`
        : activeCoin.symbol;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Generate a unique ID for the container mount
    const widgetId = `tv_chart_${Math.random().toString(36).substring(7)}`;
    
    // Create the inner div for the widget to bind to
    const innerDiv = document.createElement('div');
    innerDiv.id = widgetId;
    innerDiv.className = "w-full h-full";
    containerRef.current.appendChild(innerDiv);

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: mode === 'dark' ? "dark" : "light",
          style: "1", // Candlestick
          locale: "en",
          enable_publishing: false,
          backgroundColor: mode === 'dark' ? "#131b26" : "#ffffff", // Perfectly matches Oriviant backgrounds
          gridColor: mode === 'dark' ? "#1e293b" : "#f1f5f9",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: widgetId,
          toolbar_bg: mode === 'dark' ? "#131b26" : "#ffffff",
          studies: [
            "Volume@tv-basicstudies", // Add standard volume indicators automatically
            "MASimple@tv-basicstudies"
          ],
        });
      }
    };
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [activeCoin?.symbol, mode]);

  return (
    <div 
      className="w-full flex-1 rounded-xl overflow-hidden relative border border-app shadow-sm transition-colors duration-200" 
      style={{ height: `${height}px` }}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
});

// Add TradingView to the global Window interface to prevent TypeScript errors
declare global {
  interface Window {
    TradingView: any;
  }
}