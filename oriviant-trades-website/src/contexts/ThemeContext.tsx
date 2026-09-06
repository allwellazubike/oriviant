import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, ColorScheme, CandleColors } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  candleColors: CandleColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setCandleColors: (colors: CandleColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('oriviant_color_scheme');
    return (saved as ColorScheme) || 'blue';
  });

  const [candleColors, setCandleColorsState] = useState<CandleColors>(() => {
    const saved = localStorage.getItem('oriviant_candle_colors');
    return (saved as CandleColors) || 'green-red';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Always force dark mode
    root.classList.add('dark');
    root.classList.remove('light');

    // Set dataset attributes for accent and candle colors
    root.setAttribute('data-accent', colorScheme);
    root.setAttribute('data-candles', candleColors);

    // Save to localStorage
    localStorage.setItem('oriviant_theme', 'dark');
    localStorage.setItem('oriviant_color_scheme', colorScheme);
    localStorage.setItem('oriviant_candle_colors', candleColors);
  }, [colorScheme, candleColors]);

  const toggleTheme = () => {
    // Light mode removed - permanently dark mode
    setModeState('dark');
  };

  const setMode = (_newMode: ThemeMode) => setModeState('dark');
  const setColorScheme = (scheme: ColorScheme) => setColorSchemeState(scheme);
  const setCandleColors = (colors: CandleColors) => setCandleColorsState(colors);

  return (
    <ThemeContext.Provider 
      value={{ 
        mode, 
        colorScheme, 
        candleColors, 
        toggleTheme, 
        setMode, 
        setColorScheme, 
        setCandleColors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
