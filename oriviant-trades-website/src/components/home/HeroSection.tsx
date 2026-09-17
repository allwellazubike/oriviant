import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { NavigationTab } from '../../types';
import { AuthModal } from '../modals/AuthModal';
import { TickerMarquee } from './TickerMarquee';

interface HeroSectionProps {
  onNavigate: (tab: NavigationTab) => void;
}

const OriviantCarImage: React.FC = () => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/oriviant-f1-car-1.png';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imgData;

        // Flood fill from corners to ensure dark background pixels are transparent
        const visited = new Uint8Array(width * height);
        const queue: number[] = [
          0,
          width - 1,
          (height - 1) * width,
          (height - 1) * width + (width - 1)
        ];

        for (let i = 0; i < queue.length; i++) {
          visited[queue[i]] = 1;
        }

        let head = 0;
        const threshold = 35; // Max RGB for dark background

        while (head < queue.length) {
          const idx = queue[head++];
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];

          if (r <= threshold && g <= threshold && b <= threshold) {
            data[p + 3] = 0; // Set alpha to transparent

            const x = idx % width;
            const y = Math.floor(idx / width);

            if (x > 0 && !visited[idx - 1]) {
              visited[idx - 1] = 1;
              queue.push(idx - 1);
            }
            if (x < width - 1 && !visited[idx + 1]) {
              visited[idx + 1] = 1;
              queue.push(idx + 1);
            }
            if (y > 0 && !visited[idx - width]) {
              visited[idx - width] = 1;
              queue.push(idx - width);
            }
            if (y < height - 1 && !visited[idx + width]) {
              visited[idx + width] = 1;
              queue.push(idx + width);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        if (isMounted) {
          setProcessedSrc(dataUrl);
        }
      } catch (err) {
        console.error('Error processing car image transparency:', err);
      }
    };

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full mx-auto flex items-center justify-center overflow-visible select-none">
      <div className="relative z-10 w-full max-w-3xl px-2 flex items-center justify-center animate-float">
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/20 dark:bg-black/60 blur-lg rounded-full pointer-events-none" />
        <img
          src={processedSrc || "/images/oriviant-f1-car-1.png"}
          alt="Oriviant Formula 1 Car"
          className="w-[88%] sm:w-[92%] max-w-3xl h-auto max-h-[160px] sm:max-h-[220px] md:max-h-[270px] object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-500"
        />
      </div>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="relative w-full pt-3 pb-0 text-center select-none">
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 space-y-4 sm:space-y-6">
        
        {/* 1. Main Headline (Center aligned, Large Bold) */}
        <div className="space-y-2 pt-1">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto transition-colors">
            Trade Smarter. <br />
            <span>Move Faster.</span>
          </h1>

          {/* Subtitle with highlighted phrases in ORIVIANT blue gradient */}
          <p className="text-xs sm:text-sm md:text-base text-[#667085] dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto transition-colors">
            Trade Crypto, Forex, Stocks, Commodities and ETFs with{' '}
            <span className="bg-gradient-to-r from-[#1677FF] via-[#00C2FF] to-[#1677FF] dark:from-blue-400 dark:via-cyan-300 dark:to-cyan-400 bg-clip-text text-transparent font-extrabold">
              lightning-fast execution
            </span>{' '}
            and{' '}
            <span className="bg-gradient-to-r from-[#1677FF] via-[#00C2FF] to-[#1677FF] dark:from-blue-400 dark:via-cyan-300 dark:to-cyan-400 bg-clip-text text-transparent font-extrabold">
              institutional-grade security
            </span>.
          </p>
        </div>

        {/* 2. Promotional Campaign Section Above F1 Car */}
        <div className="relative pt-1 space-y-0.5">
          <div className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.25em] text-[#667085] dark:text-slate-300 uppercase italic transition-colors">
            WIN FROM
          </div>
          
          <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1677FF] via-[#00C2FF] to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 drop-shadow-[0_0_35px_rgba(0,194,255,0.25)] tracking-tight leading-none my-0.5">
            $2,000,000
          </div>

          <div className="text-[10px] sm:text-xs font-extrabold text-[#1677FF] dark:text-cyan-400 tracking-[0.2em] uppercase transition-colors">
            ORIVIANT GRAND PRIX CHAMPIONSHIP
          </div>

          {/* 3. ORIVIANT Formula 1 Car (Visually overlapping lower portion of $2,000,000 text) */}
          <div className="relative z-20 -mt-5 sm:-mt-8 md:-mt-10">
            <OriviantCarImage />
          </div>
        </div>

        {/* 4. Two CTA Buttons (Identical Layout, Side by Side, Immediately Underneath Car) */}
        <div className="pt-0 pb-1 -mt-2 sm:-mt-4">
          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto">
            
            {/* Left Button: Sign Up */}
            <div className="flex-1">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-white hover:bg-slate-100 text-black font-black text-xs sm:text-sm shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 border border-slate-200 dark:border-transparent"
              >
                Sign Up
              </button>
            </div>

            {/* Right Button: Download */}
            <div className="flex-1">
              <button
                onClick={() => window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install'}
                className="w-full h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-white hover:bg-slate-100 text-black font-black text-xs sm:text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200 dark:border-transparent"
              >
                <Download className="w-4 h-4 text-black shrink-0" />
                <span>Download</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Live Ticker Immediately Below CTA Buttons */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 mt-3 border-y border-slate-800/40">
        <TickerMarquee onNavigate={onNavigate} />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
        onNavigate={onNavigate}
      />

    </div>
  );
};