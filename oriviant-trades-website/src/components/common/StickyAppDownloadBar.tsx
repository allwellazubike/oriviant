import React, { useState } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { NavigationTab } from '../../types';

interface StickyAppDownloadBarProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const StickyAppDownloadBar: React.FC<StickyAppDownloadBarProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-app-sec/95 backdrop-blur-md text-app border-t border-app px-3 py-2.5 sm:px-6 sm:py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left App Icon & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-app-card border border-app p-1 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-app truncate">ORIVIANT App</span>
            </div>
            <span className="text-[10px] sm:text-xs text-app-sec font-normal truncate">Start trading on the go</span>
          </div>
        </div>

        {/* Right CTA Button & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('download')}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 sm:p-1.5 rounded-md text-app-sec hover:text-app hover:bg-app-card transition-colors cursor-pointer"
            aria-label="Close app banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
