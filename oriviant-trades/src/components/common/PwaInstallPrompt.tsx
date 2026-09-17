import React, { useState, useEffect } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";

export const PwaInstallPrompt = () => {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    // 2. Check if already installed (standalone mode)
    const standalone =
      ("standalone" in window.navigator && (window.navigator as any).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // 3. Capture Android native install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Check URL for the Landing Page Redirect Trigger
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("prompt") === "install" && !standalone) {
      // Delay slightly to let the heavy trading dashboard render first
      setTimeout(() => setIsVisible(true), 800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Strictly hide the component if isVisible is false
  if (isStandalone || !isVisible) return null;

  const closePrompt = () => {
    setIsVisible(false);
    // 🔥 CLEANUP: Remove the prompt from the URL so it doesn't re-trigger
    const url = new URL(window.location.href);
    url.searchParams.delete('prompt');
    window.history.replaceState({}, '', url);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        closePrompt();
      }
    }
  };

  return (
    <div 
      onClick={closePrompt} // Clicking the dark background safely closes it
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the card from closing it
        className="bg-app-card border border-app rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300"
      >
        {/* 🔥 BULLETPROOF BUTTON: Absolutely positioned so nothing can block it */}
        <button
          onClick={closePrompt}
          className="absolute top-4 right-4 p-2 bg-app-sec/20 hover:bg-app-sec/50 rounded-full text-app-sec hover:text-white cursor-pointer z-[99999] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-app text-sm">
              Install Oriviant App
            </h3>
            <p className="text-xs text-app-sec">
              Full-screen trading experience
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="bg-app rounded-xl p-4 text-sm text-app-sec space-y-3 border border-app">
            <p className="font-medium text-app">
              To install this app on your iPhone:
            </p>
            <ol className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-app-card text-[10px] font-bold">
                  1
                </span>
                Tap the <Share className="w-4 h-4 text-blue-500 mx-1" /> Share
                button below
              </li>
              <li className="flex items-center gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-app-card text-[10px] font-bold">
                  2
                </span>
                Select{" "}
                <span className="font-bold text-app inline-flex items-center gap-1 mx-1">
                  Add to Home Screen <PlusSquare className="w-4 h-4" />
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-app-sec">
              Install our native web application for faster execution and
              offline support.
            </p>
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm shadow-md hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {deferredPrompt ? "Add to Home Screen" : "Ready to Install..."}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};