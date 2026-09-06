import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartDownload = () => {
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setDownloadProgress(100);
        clearInterval(interval);
        setDownloading(false);
        setDownloadComplete(true);

        // Trigger real blob download for simulated APK
        const dummyApkContent = "ORIVIANT_CRYPTO_EXCHANGE_ANDROID_APK_V2.4.0_BUILD_RELEASE";
        const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Oriviant_Pro_v2.4.0.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setDownloadProgress(current);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-app-card border border-app rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-app pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-app flex items-center gap-1.5">
                Oriviant Mobile App
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-500 uppercase">
                  v2.4.0
                </span>
              </h3>
              <p className="text-xs text-app-sec">Official Android APK Release</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app hover:bg-app-sec/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Features Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-[10px] text-app-sec block font-medium">FILE SIZE</span>
            <span className="font-black text-app">48.2 MB</span>
          </div>
          <div className="p-3 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-[10px] text-app-sec block font-medium">REQUIREMENTS</span>
            <span className="font-black text-app">Android 7.0+</span>
          </div>
          <div className="p-3 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-[10px] text-app-sec block font-medium">SECURITY</span>
            <span className="font-black text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Safe
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-app-sec/40 border border-app">
            <span className="text-[10px] text-app-sec block font-medium">FEATURES</span>
            <span className="font-black text-app">Spot, Futures, Copy</span>
          </div>
        </div>

        {/* QR Code Scan Section */}
        <div className="p-4 rounded-2xl bg-app-sec/30 border border-app flex items-center gap-4">
          <div className="w-20 h-20 bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-app flex items-center gap-1">
              Scan with Phone Camera
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-[11px] text-app-sec leading-relaxed">
              Scan this QR code from your Android device to open direct installation link immediately.
            </p>
          </div>
        </div>

        {/* Download Action Progress */}
        {downloading ? (
          <div className="space-y-2 p-4 rounded-2xl bg-app-sec border border-app">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-app">Downloading APK...</span>
              <span className="text-accent">{downloadProgress}%</span>
            </div>
            <div className="w-full bg-app-card h-2.5 rounded-full overflow-hidden border border-app">
              <div 
                className="bg-accent h-full transition-all duration-200 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        ) : downloadComplete ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">APK Downloaded Successfully!</p>
              <p className="text-[11px] text-app-sec">Open your browser downloads to tap and install Oriviant Pro.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartDownload}
            className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-extrabold text-sm shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2 group"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            <span>Download Oriviant_Pro_v2.4.0.apk (48.2 MB)</span>
          </button>
        )}

        {/* Installation Tip */}
        <div className="flex items-start gap-2 text-[11px] text-app-sec pt-1">
          <Info className="w-4 h-4 text-app-sec shrink-0 mt-0.5" />
          <span>
            If prompted during install, allow "Install from unknown sources" in your Android security settings.
          </span>
        </div>

      </div>
    </div>
  );
};
