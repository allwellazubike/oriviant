import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode, 
  LineStyle,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BaselineSeries,
  HistogramSeries,
  UTCTimestamp
} from 'lightweight-charts';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  BarChart2, 
  Eye, 
  EyeOff,
  Layers
} from 'lucide-react';
import { useTrading } from '../../contexts/TradingContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CryptoCoin } from '../../types';

export type ChartType = 'candles' | 'hollow' | 'line' | 'area' | 'baseline' | 'heikin-ashi';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

export interface IndicatorSettings {
  volume: boolean;
  ma: boolean;
  ema: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface OHLCData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  coin?: CryptoCoin;
  height?: number;
  showToolbar?: boolean;
}

// Convert timeframe code to seconds
const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
};

// Generate realistic historical OHLC data ending at the current price
function generateOHLCData(coin: CryptoCoin, timeframe: Timeframe, count = 120): OHLCData[] {
  const stepSeconds = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * stepSeconds;

  const data: OHLCData[] = [];
  let currentPrice = coin.price;
  const precision = coin.precision;
  
  // Volatility scaling based on price magnitude and timeframe
  const baseVol = Math.max(currentPrice * 0.003, Math.pow(10, -precision));

  // Generate backward, then reverse
  const generatedPrices: { open: number; high: number; low: number; close: number; volume: number }[] = [];
  let priceRunner = currentPrice;

  for (let i = count - 1; i >= 0; i--) {
    const isLast = i === 0;
    const close = isLast ? currentPrice : priceRunner;
    
    // Random walk delta
    const deltaPercent = (Math.sin(i * 0.15) * 0.4 + (Math.random() - 0.49) * 1.2) * 0.008;
    const open = isLast 
      ? Math.max(Math.pow(10, -precision), parseFloat((close * (1 - deltaPercent * 0.5)).toFixed(precision)))
      : Math.max(Math.pow(10, -precision), parseFloat((close * (1 - deltaPercent)).toFixed(precision)));
    
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const high = parseFloat((maxOC + Math.random() * baseVol).toFixed(precision));
    const low = Math.max(Math.pow(10, -precision), parseFloat((minOC - Math.random() * baseVol).toFixed(precision)));
    const volume = Math.floor(1000 + Math.random() * 50000 + (maxOC - minOC) * 1000);

    generatedPrices.unshift({ open, high, low, close, volume });
    priceRunner = open;
  }

  for (let i = 0; i < count; i++) {
    const time = (startTime + i * stepSeconds) as UTCTimestamp;
    const item = generatedPrices[i];
    data.push({
      time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    });
  }

  return data;
}

// Transform standard candles to Heikin Ashi candles
function calculateHeikinAshi(candles: OHLCData[]): OHLCData[] {
  if (candles.length === 0) return [];
  const result: OHLCData[] = [];

  let prevHAOpen = candles[0].open;
  let prevHAClose = (candles[0].open + candles[0].high + candles[0].low + candles[0].close) / 4;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevHAOpen + prevHAClose) / 2;
    const haHigh = Math.max(c.high, haOpen, haClose);
    const haLow = Math.min(c.low, haOpen, haClose);

    result.push({
      time: c.time,
      open: parseFloat(haOpen.toFixed(8)),
      high: parseFloat(haHigh.toFixed(8)),
      low: parseFloat(haLow.toFixed(8)),
      close: parseFloat(haClose.toFixed(8)),
      volume: c.volume,
    });

    prevHAOpen = haOpen;
    prevHAClose = haClose;
  }

  return result;
}

// Indicator Calculation Helpers
function calculateSMA(data: OHLCData[], period: number) {
  const result: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateEMA(data: OHLCData[], period: number) {
  const result: { time: UTCTimestamp; value: number }[] = [];
  if (data.length < period) return result;

  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i].close;
  let prevEMA = sum / period;
  result.push({ time: data[period - 1].time, value: prevEMA });

  for (let i = period; i < data.length; i++) {
    const currentEMA = data[i].close * k + prevEMA * (1 - k);
    result.push({ time: data[i].time, value: currentEMA });
    prevEMA = currentEMA;
  }
  return result;
}

function calculateBollingerBands(data: OHLCData[], period = 20, multiplier = 2) {
  const upper: { time: UTCTimestamp; value: number }[] = [];
  const middle: { time: UTCTimestamp; value: number }[] = [];
  const lower: { time: UTCTimestamp; value: number }[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    const avg = sum / period;

    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j].close - avg, 2);
    }
    const stdDev = Math.sqrt(variance / period);

    const time = data[i].time;
    middle.push({ time, value: avg });
    upper.push({ time, value: avg + multiplier * stdDev });
    lower.push({ time, value: avg - multiplier * stdDev });
  }

  return { upper, middle, lower };
}

function calculateRSI(data: OHLCData[], period = 14) {
  const result: { time: UTCTimestamp; value: number }[] = [];
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  result.push({ time: data[period].time, value: rsi });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
    result.push({ time: data[i].time, value: rsi });
  }

  return result;
}

function calculateMACD(data: OHLCData[], fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);

  const macdLine: { time: UTCTimestamp; value: number }[] = [];
  const slowMap = new Map(emaSlow.map((item) => [item.time, item.value]));

  for (const item of emaFast) {
    const slowVal = slowMap.get(item.time);
    if (slowVal !== undefined) {
      macdLine.push({ time: item.time, value: item.value - slowVal });
    }
  }

  // Calculate signal line (EMA of MACD Line)
  const signalLine: { time: UTCTimestamp; value: number }[] = [];
  if (macdLine.length >= signal) {
    const k = 2 / (signal + 1);
    let sum = 0;
    for (let i = 0; i < signal; i++) sum += macdLine[i].value;
    let prevEMA = sum / signal;
    signalLine.push({ time: macdLine[signal - 1].time, value: prevEMA });

    for (let i = signal; i < macdLine.length; i++) {
      const currentEMA = macdLine[i].value * k + prevEMA * (1 - k);
      signalLine.push({ time: macdLine[i].time, value: currentEMA });
      prevEMA = currentEMA;
    }
  }

  const signalMap = new Map(signalLine.map((s) => [s.time, s.value]));
  const histogram: { time: UTCTimestamp; value: number; color: string }[] = [];

  for (const m of macdLine) {
    const sigVal = signalMap.get(m.time);
    if (sigVal !== undefined) {
      const histVal = m.value - sigVal;
      histogram.push({
        time: m.time,
        value: histVal,
        color: histVal >= 0 ? '#10B981' : '#EF4444',
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

export const TradingChart: React.FC<TradingChartProps> = ({
  coin: propCoin,
  height = 420,
  showToolbar = true,
}) => {
  const { activeCoin: contextCoin } = useTrading();
  const { mode } = useTheme();
  
  const coin = propCoin || contextCoin;
  const isDark = mode === 'dark';

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  // Indicator Series Refs
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);

  // States
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState<boolean>(false);

  const [indicators, setIndicators] = useState<IndicatorSettings>({
    volume: true,
    ma: false,
    ema: true,
    bollinger: false,
    rsi: false,
    macd: false,
  });

  // Current Hovered Legend State
  const [hoverData, setHoverData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    changePercent?: number;
  } | null>(null);

  // Raw Historical Data
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);

  // Initialize/Generate OHLC data when coin symbol or timeframe changes
  useEffect(() => {
    const raw = generateOHLCData(coin, timeframe);
    setOhlcData(raw);
  }, [coin.symbol, timeframe]);

  // Update latest bar dynamically when coin.price ticks
  useEffect(() => {
    if (ohlcData.length === 0) return;

    setOhlcData((prev) => {
      if (prev.length === 0) return prev;
      const lastIdx = prev.length - 1;
      const lastBar = prev[lastIdx];
      const newPrice = coin.price;

      // Update last bar
      const updatedBar: OHLCData = {
        ...lastBar,
        close: newPrice,
        high: Math.max(lastBar.high, newPrice),
        low: Math.min(lastBar.low, newPrice),
      };

      const updated = [...prev];
      updated[lastIdx] = updatedBar;
      return updated;
    });
  }, [coin.price]);

  // Chart Rendering & Subscriptions
  useEffect(() => {
    if (!chartContainerRef.current || ohlcData.length === 0) return;

    // Clear previous chart
    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth || 800;

    // Theme palette setup
    const bgColor = isDark ? '#1b2230' : '#ffffff';
    const textColor = isDark ? '#9aa4b2' : '#6b7280';
    const gridColor = isDark ? 'rgba(43, 52, 69, 0.5)' : 'rgba(226, 232, 240, 0.8)';
    const bullColor = '#10B981';
    const bearColor = '#EF4444';

    // Create Lightweight Chart instance
    const chart = createChart(container, {
      width: containerWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontFamily: 'monospace, system-ui, sans-serif',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: gridColor, style: LineStyle.Dotted },
        horzLines: { color: gridColor, style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? '#4b5563' : '#9ca3af',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#2b3445' : '#1e293b',
        },
        horzLine: {
          color: isDark ? '#4b5563' : '#9ca3af',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#2b3445' : '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2b3445' : '#e2e8f0',
        scaleMargins: {
          top: 0.1,
          bottom: indicators.volume ? 0.25 : 0.1,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: isDark ? '#2b3445' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
    });

    chartApiRef.current = chart;

    // Process candles according to chart type
    const processData = chartType === 'heikin-ashi' ? calculateHeikinAshi(ohlcData) : ohlcData;

    // Add main price series
    let mainSeries: ISeriesApi<any>;

    if (chartType === 'candles' || chartType === 'heikin-ashi') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: bullColor,
        downColor: bearColor,
        borderVisible: false,
        wickUpColor: bullColor,
        wickDownColor: bearColor,
        priceFormat: { type: 'price', precision: coin.precision, minMove: Math.pow(10, -coin.precision) },
      });
      mainSeries.setData(
        processData.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    } else if (chartType === 'hollow') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: 'transparent',
        downColor: bearColor,
        borderUpColor: bullColor,
        borderDownColor: bearColor,
        wickUpColor: bullColor,
        wickDownColor: bearColor,
        priceFormat: { type: 'price', precision: coin.precision, minMove: Math.pow(10, -coin.precision) },
      });
      mainSeries.setData(
        processData.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    } else if (chartType === 'line') {
      mainSeries = chart.addSeries(LineSeries, {
        color: '#2563EB',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: coin.precision, minMove: Math.pow(10, -coin.precision) },
      });
      mainSeries.setData(processData.map((d) => ({ time: d.time, value: d.close })));
    } else if (chartType === 'area') {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(37, 99, 235, 0.4)',
        bottomColor: 'rgba(37, 99, 235, 0.02)',
        lineColor: '#2563EB',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: coin.precision, minMove: Math.pow(10, -coin.precision) },
      });
      mainSeries.setData(processData.map((d) => ({ time: d.time, value: d.close })));
    } else { // baseline
      const avgPrice = processData.reduce((acc, d) => acc + d.close, 0) / processData.length;
      mainSeries = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: avgPrice },
        topLineColor: bullColor,
        topFillColor1: 'rgba(16, 185, 129, 0.28)',
        topFillColor2: 'rgba(16, 185, 129, 0.05)',
        bottomLineColor: bearColor,
        bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
        bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: coin.precision, minMove: Math.pow(10, -coin.precision) },
      });
      mainSeries.setData(processData.map((d) => ({ time: d.time, value: d.close })));
    }

    mainSeriesRef.current = mainSeries;

    // Add Volume Histogram if enabled
    if (indicators.volume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Set as overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.75,
          bottom: 0,
        },
      });

      volumeSeries.setData(
        processData.map((d) => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        }))
      );
      volumeSeriesRef.current = volumeSeries;
    }

    // Moving Averages (MA 20 & MA 50)
    if (indicators.ma) {
      const ma20Data = calculateSMA(processData, 20);
      const ma50Data = calculateSMA(processData, 50);

      const ma20Series = chart.addSeries(LineSeries, { color: '#F59E0B', lineWidth: 1, title: 'MA 20' });
      ma20Series.setData(ma20Data);
      ma20SeriesRef.current = ma20Series;

      const ma50Series = chart.addSeries(LineSeries, { color: '#8B5CF6', lineWidth: 1, title: 'MA 50' });
      ma50Series.setData(ma50Data);
      ma50SeriesRef.current = ma50Series;
    }

    // Exponential Moving Averages (EMA 9 & EMA 21)
    if (indicators.ema) {
      const ema9Data = calculateEMA(processData, 9);
      const ema21Data = calculateEMA(processData, 21);

      const ema9Series = chart.addSeries(LineSeries, { color: '#3B82F6', lineWidth: 1, title: 'EMA 9' });
      ema9Series.setData(ema9Data);
      ema9SeriesRef.current = ema9Series;

      const ema21Series = chart.addSeries(LineSeries, { color: '#EC4899', lineWidth: 1, title: 'EMA 21' });
      ema21Series.setData(ema21Data);
      ema21SeriesRef.current = ema21Series;
    }

    // Bollinger Bands
    if (indicators.bollinger) {
      const bb = calculateBollingerBands(processData, 20, 2);

      const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.6)', lineWidth: 1, lineStyle: LineStyle.Dashed });
      bbUpper.setData(bb.upper);
      bbUpperRef.current = bbUpper;

      const bbMiddle = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 1 });
      bbMiddle.setData(bb.middle);
      bbMiddleRef.current = bbMiddle;

      const bbLower = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.6)', lineWidth: 1, lineStyle: LineStyle.Dashed });
      bbLower.setData(bb.lower);
      bbLowerRef.current = bbLower;
    }

    // Crosshair move listener for floating legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || param.point === undefined || param.point.x < 0 || param.point.y < 0) {
        // Fallback to latest candle
        const last = processData[processData.length - 1];
        if (last) {
          const chg = ((last.close - last.open) / last.open) * 100;
          setHoverData({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: last.volume,
            changePercent: chg,
          });
        }
        return;
      }

      const bar = processData.find((d) => d.time === param.time);
      if (bar) {
        const chg = ((bar.close - bar.open) / bar.open) * 100;
        setHoverData({
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
          changePercent: chg,
        });
      }
    });

    // Auto-fit content
    chart.timeScale().fitContent();

    // ResizeObserver for fluid responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartApiRef.current) {
        chartApiRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartApiRef.current) {
        chartApiRef.current.remove();
        chartApiRef.current = null;
      }
    };
  }, [ohlcData, chartType, indicators, isDark, height, coin.precision]);

  // Set initial hover state to current candle
  const activeCandle = useMemo(() => {
    if (ohlcData.length === 0) return null;
    const last = ohlcData[ohlcData.length - 1];
    const chg = ((last.close - last.open) / last.open) * 100;
    return { ...last, changePercent: chg };
  }, [ohlcData]);

  const displayData = hoverData || activeCandle;

  const toggleIndicator = (key: keyof IndicatorSettings) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetView = () => {
    if (chartApiRef.current) {
      chartApiRef.current.timeScale().fitContent();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative flex flex-col w-full h-full min-w-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-app-card p-4 sm:p-6' : ''}`}>
      
      {/* Top Toolbar Bar */}
      {showToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2 border-b border-app/80 min-w-0">
          
          {/* Timeframe & Chart Style Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Timeframes */}
            <div className="flex items-center gap-0.5 bg-app-sec p-1 rounded-xl border border-app shrink-0">
              {(['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeframe === tf
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-app-sec hover:text-app hover:bg-app-card/60'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-0.5 bg-app-sec p-1 rounded-xl border border-app shrink-0">
              <button
                onClick={() => setChartType('candles')}
                title="Standard Candlestick"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'candles' ? 'bg-app-card text-accent font-extrabold shadow-xs' : 'text-app-sec hover:text-app'
                }`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType('hollow')}
                title="Hollow Candles"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'hollow' ? 'bg-app-card text-accent font-extrabold shadow-xs' : 'text-app-sec hover:text-app'
                }`}
              >
                Hollow
              </button>
              <button
                onClick={() => setChartType('line')}
                title="Line Chart"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'line' ? 'bg-app-card text-accent font-extrabold shadow-xs' : 'text-app-sec hover:text-app'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                title="Area Chart"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'area' ? 'bg-app-card text-accent font-extrabold shadow-xs' : 'text-app-sec hover:text-app'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('heikin-ashi')}
                title="Heikin Ashi"
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartType === 'heikin-ashi' ? 'bg-app-card text-accent font-extrabold shadow-xs' : 'text-app-sec hover:text-app'
                }`}
              >
                Heikin Ashi
              </button>
            </div>

          </div>

          {/* Right Indicator & View Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
            
            {/* Indicators Quick Chips */}
            <div className="relative">
              <button
                onClick={() => setShowIndicatorsMenu(!showIndicatorsMenu)}
                className="px-2.5 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-accent" />
                <span>Indicators</span>
              </button>

              {/* Indicators Dropdown Menu */}
              {showIndicatorsMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-app-card border border-app rounded-2xl p-2 shadow-xl z-30 space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-app-sec uppercase px-2 py-1">Technical Overlays</div>
                  
                  <button
                    onClick={() => toggleIndicator('volume')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left font-semibold flex items-center justify-between ${
                      indicators.volume ? 'bg-accent/10 text-accent font-bold' : 'text-app hover:bg-app-sec'
                    }`}
                  >
                    <span>Volume Histogram</span>
                    {indicators.volume ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 text-app-sec" />}
                  </button>

                  <button
                    onClick={() => toggleIndicator('ema')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left font-semibold flex items-center justify-between ${
                      indicators.ema ? 'bg-accent/10 text-accent font-bold' : 'text-app hover:bg-app-sec'
                    }`}
                  >
                    <span>EMA (9, 21)</span>
                    {indicators.ema ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 text-app-sec" />}
                  </button>

                  <button
                    onClick={() => toggleIndicator('ma')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left font-semibold flex items-center justify-between ${
                      indicators.ma ? 'bg-accent/10 text-accent font-bold' : 'text-app hover:bg-app-sec'
                    }`}
                  >
                    <span>MA (20, 50)</span>
                    {indicators.ma ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 text-app-sec" />}
                  </button>

                  <button
                    onClick={() => toggleIndicator('bollinger')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left font-semibold flex items-center justify-between ${
                      indicators.bollinger ? 'bg-accent/10 text-accent font-bold' : 'text-app hover:bg-app-sec'
                    }`}
                  >
                    <span>Bollinger Bands</span>
                    {indicators.bollinger ? <Eye className="w-3.5 h-3.5 text-accent" /> : <EyeOff className="w-3.5 h-3.5 text-app-sec" />}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={resetView}
              title="Reset Zoom & Pan"
              className="p-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen Chart"
              className="p-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app border border-app transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

          </div>

        </div>
      )}

      {/* Floating Live OHLC Legend */}
      {displayData && (
        <div className="flex items-center gap-3 text-[11px] font-mono text-app-sec overflow-x-auto no-scrollbar py-1 px-1 bg-app-sec/40 rounded-lg border border-app/50 mb-1">
          <span className="font-bold text-app uppercase shrink-0">{coin.symbol}</span>
          <span>O: <strong className="text-app">{displayData.open?.toFixed(coin.precision)}</strong></span>
          <span>H: <strong className="text-app">{displayData.high?.toFixed(coin.precision)}</strong></span>
          <span>L: <strong className="text-app">{displayData.low?.toFixed(coin.precision)}</strong></span>
          <span>C: <strong className="text-app">{displayData.close?.toFixed(coin.precision)}</strong></span>
          {displayData.changePercent !== undefined && (
            <span className={`font-bold ${displayData.changePercent >= 0 ? 'text-positive' : 'text-negative'}`}>
              {displayData.changePercent >= 0 ? '+' : ''}{displayData.changePercent.toFixed(2)}%
            </span>
          )}
          {displayData.volume !== undefined && (
            <span className="hidden sm:inline">Vol: <strong className="text-app">{displayData.volume.toLocaleString()}</strong></span>
          )}
        </div>
      )}

      {/* Lightweight Chart Render Canvas Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full flex-1 min-h-[300px] rounded-xl overflow-hidden touch-pan-x touch-pan-y"
      />

    </div>
  );
};
