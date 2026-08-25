import React, { useEffect, useRef, memo } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TradingChartProps {
  height?: number;
  symbol?: string; // 🔥 Added optional symbol override for the demo workspace switcher
}

// 🔥 Professional Symbol Resolver for Multi-Asset TradingView Support
const resolveTVSymbol = (symbol: string) => {
  // Forex Pairs
  if (['EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD', 'USD/CAD', 'EUR/JPY', 'USD/CHF', 'EUR/GBP', 'NZD/USD', 'AUD/JPY'].includes(symbol)) {
    return `FX:${symbol.replace('/', '')}`;
  }
  
  // Indices, Commodities, ETFs, and Stocks
  const customMap: Record<string, string> = {
    'SPY': 'AMEX:SPY',
    'QQQ': 'NASDAQ:QQQ',
    'VOO': 'AMEX:VOO',
    'IWM': 'AMEX:IWM',
    'VTI': 'AMEX:VTI',
    'DIA': 'AMEX:DIA',
    'XLK': 'AMEX:XLK',
    'XLF': 'AMEX:XLF',
    'XLE': 'AMEX:XLE',
    'ARKK': 'AMEX:ARKK',
    'NAS100': 'CAPITALCOM:US100',
    'US500': 'CAPITALCOM:US500',
    'US30': 'CAPITALCOM:US30',
    'UK100': 'CAPITALCOM:UK100',
    'GER40': 'CAPITALCOM:DE40',
    'JP225': 'CAPITALCOM:JP225',
    'HK50': 'CAPITALCOM:HK50',
    'XAU/USD': 'OANDA:XAUUSD',
    'XAG/USD': 'OANDA:XAGUSD',
    'USOIL': 'TVC:USOIL',
    'UKOIL': 'TVC:UKOIL',
    'NG': 'TVC:USOIL',
    'US10Y': 'TVC:US10Y',
    'US30Y': 'TVC:US30Y',
    'BUND': 'EUREX:RX1!'
  };

  if (customMap[symbol]) {
    return customMap[symbol];
  }

  // Default Crypto Assuming Binance Formatting
  if (symbol.includes('/')) {
    return `BINANCE:${symbol.replace('/', '')}`;
  }
  
  // Ultimate fallback
  return symbol;
};

export const TradingChart: React.FC<TradingChartProps> = memo(({ height = 460, symbol }) => {
  const { activeCoin } = useTrading();
  const { mode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔥 Determine the target symbol: use prop symbol if provided, otherwise fallback to activeCoin.symbol
  const currentSymbol = symbol || activeCoin?.symbol || 'GER40';

  useEffect(() => {
    if (!containerRef.current || !currentSymbol) return;
    
    // Clean up previous widget injection to prevent duplicates
    containerRef.current.innerHTML = '';
    
    const formattedSymbol = resolveTVSymbol(currentSymbol);
    
    // Generate a unique ID for the container mount
    const widgetId = `tv_chart_${Math.random().toString(36).substring(7)}`;
    
    // Create the inner div for the widget to bind to
    const innerDiv = document.createElement('div');
    innerDiv.id = widgetId;
    innerDiv.className = "w-full h-full";
    containerRef.current.appendChild(innerDiv);

    const initWidget = () => {
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
          backgroundColor: mode === 'dark' ? "#131b26" : "#ffffff",
          gridColor: mode === 'dark' ? "#1e293b" : "#f1f5f9",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: widgetId,
          toolbar_bg: mode === 'dark' ? "#131b26" : "#ffffff",
          studies: [
            "Volume@tv-basicstudies",
            "MASimple@tv-basicstudies"
          ],
        });
      }
    };

    if (!window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = initWidget;
      containerRef.current.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentSymbol, mode]);

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