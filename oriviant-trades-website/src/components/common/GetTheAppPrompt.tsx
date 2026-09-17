import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { APK_FILE_NAME, APK_PATH, APP_INSTALL_URL, isAndroid, isIos, isStandalone } from '../../utils/appLinks';

const DISMISSED_KEY = 'oriviant_app_prompt_dismissed';

/**
 * Invites every website visitor to install the app.
 *
 * The website is the shop window; the app is the product. Anyone landing here
 * is offered the app once per visit, on desktop as well as mobile — the app is
 * a PWA, so it installs from any browser.
 *
 * Dismissal is remembered for a week rather than forever: someone who says "not
 * now" on their phone should be asked again on their next visit, but not on
 * every page they open today.
 */
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

export const GetTheAppPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Someone already running the installed app does not need to be sold it.
    if (isStandalone()) return;

    setPlatform(isIos() ? 'ios' : isAndroid() ? 'android' : 'other');

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) || 0);
    } catch {
      // Private browsing can refuse storage — show the prompt anyway.
    }
    if (dismissedAt && Date.now() - dismissedAt < REMEMBER_MS) return;

    // Let the page paint first: an invitation that lands on top of a blank
    // screen reads as a pop-up, not an offer.
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const dismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* nothing to remember it with — it will show again next visit */
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[95] px-3 pb-3 sm:px-4 sm:pb-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      role="dialog"
      aria-label="Install the Oriviant app"
    >
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#101828] p-4 text-white shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1677FF]/20 text-[#00C2FF]">
            <Smartphone className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">Get the ORIVIANT app</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
              {platform === 'ios'
                ? 'Install it from Safari in two taps — no App Store needed — for a full-screen trading view and price alerts.'
                : platform === 'android'
                  ? 'Get the Android app for faster execution, price alerts and a full-screen trading view.'
                  : 'Install it on your phone or desktop for faster execution, price alerts and a full-screen trading view. Works on iPhone and Android.'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {platform === 'android' ? (
                <a
                  href={APK_PATH}
                  download={APK_FILE_NAME}
                  onClick={dismiss}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#1677FF]/90"
                >
                  <Download className="h-4 w-4" />
                  Download APK
                </a>
              ) : (
                <a
                  href={APP_INSTALL_URL}
                  onClick={dismiss}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1677FF] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#1677FF]/90"
                >
                  {platform === 'ios' ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  {platform === 'ios' ? 'Install for iPhone' : 'Install the app'}
                </a>
              )}
              <button
                onClick={dismiss}
                className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={dismiss}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
