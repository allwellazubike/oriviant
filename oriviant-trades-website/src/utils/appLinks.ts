/**
 * Where the website sends people to get the app.
 *
 * The app is a PWA served from its own deployment, so "getting the app" is a
 * link rather than a store listing. `?prompt=install` tells the app to open its
 * install prompt as soon as it loads, which is what makes the hand-off feel
 * like an install rather than just another page.
 */

export const APP_URL =
  (import.meta.env.VITE_APP_URL as string | undefined) || "https://oriviant-delta.vercel.app";

export const APP_INSTALL_URL = `${APP_URL.replace(/\/+$/, "")}/?prompt=install`;

/** iPhones and iPads install by way of Safari's Share menu, never a prompt. */
export const isIos = (): boolean =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports itself as a Mac, so it needs the touch check too.
    (/macintosh/i.test(navigator.userAgent) && (navigator as any).maxTouchPoints > 1));

/** Android phones and tablets, which can install the APK or the PWA. */
export const isAndroid = (): boolean =>
  typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

/** The APK is an Android package: iPhones and iPads cannot open it at all. */
export const APK_PATH = "/oriviant-v1.apk";
export const APK_FILE_NAME = "Oriviant-App.apk";

/** True once the site is running from a home screen icon rather than a browser tab. */
export const isStandalone = (): boolean =>
  typeof window !== "undefined" &&
  (("standalone" in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches);
