import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export const PwaInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Detect if it's an iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if the app is already installed/running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIphoneOrIpad && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // 2. Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Stop Chrome from showing the default mini-infobar
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setInstallPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-app-card border border-app shadow-2xl p-4 rounded-2xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-app text-sm">Install Oriviant App</h3>
        <button onClick={() => setShowPrompt(false)} className="text-app-sec hover:text-app">
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="text-xs text-app-sec space-y-2">
          <p>To install this app on your iPhone:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li className="flex items-center gap-1">Tap the <Share className="w-3 h-3 mx-1" /> Share button below</li>
            <li className="flex items-center gap-1">Select <PlusSquare className="w-3 h-3 mx-1" /> <strong>Add to Home Screen</strong></li>
          </ol>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-app-sec">Install our web application for a faster, full-screen trading experience.</p>
          <button 
            onClick={handleInstallClick}
            className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Add to Home Screen
          </button>
        </div>
      )}
    </div>
  );
};