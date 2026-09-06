import React from 'react';
import { X, Sun, Moon, Laptop, Palette, Check, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeMode, ColorScheme, CandleColors } from '../../types';
import { useOverlayRegistration } from '../../utils/OverlayRegistry';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_SCHEMES: { id: ColorScheme; name: string; colorHex: string; cyanHex: string }[] = [
  { id: 'blue', name: 'Royal Blue', colorHex: '#3b82f6', cyanHex: '#22d3ee' },
  { id: 'emerald', name: 'Emerald Green', colorHex: '#10b981', cyanHex: '#2dd4bf' },
  { id: 'purple', name: 'Cyber Violet', colorHex: '#8b5cf6', cyanHex: '#e879f9' },
  { id: 'amber', name: 'Amber Gold', colorHex: '#f59e0b', cyanHex: '#fb923c' },
  { id: 'rose', name: 'Crimson Rose', colorHex: '#f43f5e', cyanHex: '#f472b6' },
  { id: 'cyan', name: 'Electric Cyan', colorHex: '#06b6d4', cyanHex: '#38bdf8' },
];

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ isOpen, onClose }) => {
  const { mode, colorScheme, candleColors, setMode, setColorScheme, setCandleColors } = useTheme();

  useOverlayRegistration('theme-settings-modal', isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-app-card border border-app rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-app flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-app">Appearance & Color Customizer</h3>
              <p className="text-xs text-app-sec">Personalize theme mode, accent colors, and chart styles</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* 1. Theme Mode Selection */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-app-sec block">
              Theme Mode
            </label>
            <div className="p-3.5 rounded-2xl bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">Dark Mode (Default)</span>
              </div>
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* 2. Primary Accent Color Scheme */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-app-sec block">
              Primary Accent Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ACCENT_SCHEMES.map((scheme) => {
                const isActive = colorScheme === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-app border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                        : 'bg-app-sec hover:bg-app border-app text-app-sec hover:text-app'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: scheme.colorHex }}
                    >
                      {isActive && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold truncate text-app">{scheme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Candlestick Chart Color Convention */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-app-sec block">
              Market Candle Chart Scheme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCandleColors('green-red')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  candleColors === 'green-red'
                    ? 'bg-app border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-app-sec hover:bg-app border-app'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-app">Green Up / Red Down</div>
                  <div className="text-[10px] text-app-sec">Western / International</div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-5 bg-emerald-500 rounded-sm" />
                  <div className="w-3 h-5 bg-rose-500 rounded-sm" />
                </div>
              </button>

              <button
                onClick={() => setCandleColors('red-green')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  candleColors === 'red-green'
                    ? 'bg-app border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-app-sec hover:bg-app border-app'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-app">Red Up / Green Down</div>
                  <div className="text-[10px] text-app-sec">Asian / Custom Standard</div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-5 bg-rose-500 rounded-sm" />
                  <div className="w-3 h-5 bg-emerald-500 rounded-sm" />
                </div>
              </button>
            </div>
          </div>

          {/* Live Component Preview */}
          <div className="p-4 rounded-2xl bg-app-sec border border-app space-y-3">
            <div className="text-[11px] font-extrabold text-app-sec uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Live Theme Preview</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-app-card border border-app">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
                  BTC
                </div>
                <div>
                  <span className="text-xs font-black text-app block">Bitcoin / Tether</span>
                  <span className="text-[10px] text-app-sec font-mono">$96,480.00</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-positive flex items-center gap-0.5 justify-end">
                  <TrendingUp className="w-3 h-3" /> +4.25%
                </span>
                <span className="text-[10px] text-app-sec">24h Vol: $4.2B</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-black text-xs shadow-sm">
                Trade Now
              </button>
              <div className="px-3 py-2 rounded-xl bg-app-card border border-app text-xs font-bold text-app-sec flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-app bg-app-sec flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
