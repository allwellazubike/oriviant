import React, { useEffect, useState } from 'react';
import { X, Download, Sparkles, Share } from 'lucide-react';
import { NavigationTab } from '../../types';
import { APK_FILE_NAME, APK_PATH, APP_INSTALL_URL, isAndroid, isIos, isStandalone } from '../../utils/appLinks';

interface StickyAppDownloadBarProps {
  onNavigate: (tab: NavigationTab) => void;
}

/**
 * The bar offers what the device can actually use.
 *
 * The APK is an Android package — an iPhone cannot open one, so offering a
 * download to an iOS visitor is a dead end. iOS installs the PWA instead, which
 * happens on the app's own address: "Add to Home Screen" saves whatever page is
 * open, so saving it here would pin the marketing site rather than the app.
 */
export const StickyAppDownloadBar: React.FC<StickyAppDownloadBarProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Read after mount: the user agent is not available while rendering on a
    // build machine, and a wrong guess here shows the wrong download.
    if (isStandalone()) {
      setIsVisible(false);
      return;
    }
    setPlatform(isIos() ? 'ios' : isAndroid() ? 'android' : 'other');
  }, []);

  if (!isVisible) return null;

  const subtitle =
    platform === 'ios'
      ? 'Add it to your Home Screen'
      : platform === 'android'
        ? 'Install the Android app'
        : 'Start trading on the go';

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
            <span className="text-[10px] sm:text-xs text-app-sec font-normal truncate">{subtitle}</span>
          </div>
        </div>

        {/* Right CTA Button & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {platform === 'ios' ? (
            <a
              href={APP_INSTALL_URL}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Install for iPhone</span>
            </a>
          ) : platform === 'android' ? (
            <a
              href={APK_PATH}
              download={APK_FILE_NAME}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
          ) : (
            <button
              onClick={() => onNavigate('download')}
              className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get the app</span>
            </button>
          )}

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
