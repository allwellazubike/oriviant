import React from 'react';
import { APP_INSTALL_URL } from '../../utils/appLinks';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Zap, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  KeyRound, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';

export const DownloadAppView: React.FC = () => {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-accent/30 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-black uppercase tracking-wider">
              <Smartphone className="w-4 h-4" /> Official ORIVIANT Mobile Engine
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Trade Global Markets Anywhere, Anytime
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience institutional-grade execution speed, zero latency websockets, biometric security, and full Spot & Futures trading capabilities on the official ORIVIANT Mobile Application.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="/oriviant-v1.apk" download="Oriviant-App.apk">
                <button
                  className="px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-accent/30 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Android APK (v2.4.0)</span>
                </button>
              </a>

              <a href={APP_INSTALL_URL}>
                <button
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                  title="Install Oriviant on your iPhone or iPad"
                >
                  <AppleLogo className="w-4 h-4 fill-white" />
                  <span>iPhone &amp; iPad — Install</span>
                </button>
              </a>
            </div>

            {/* Version Specs */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-2">
              <span>Latest Build: <strong className="text-white">v2.4.0 (Official)</strong></span>
              <span>•</span>
              <span>Package Size: <strong className="text-white">48.2 MB</strong></span>
              <span>•</span>
              <span>Requires: <strong className="text-white">Android 8.0+</strong></span>
              <span>•</span>
              <span>iOS: <strong className="text-white">Installs from Safari, no App Store needed</strong></span>
            </div>
          </div>

          {/* QR Code & Phone Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md shadow-2xl text-center space-y-3 w-full max-w-xs">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <QrCode className="w-4 h-4" /> Scan QR Code to Download
              </div>

              {/* QR Code SVG Visual */}
              <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                  <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                  <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                  <rect x="40" y="5" width="10" height="20" />
                  <rect x="40" y="35" width="20" height="10" />
                  <rect x="10" y="40" width="20" height="20" />
                  <rect x="70" y="40" width="10" height="20" />
                  <rect x="45" y="55" width="30" height="10" />
                  <rect x="40" y="75" width="15" height="20" />
                  <rect x="65" y="75" width="30" height="20" />
                </svg>
              </div>

              <p className="text-[11px] text-slate-400">
                Point your mobile camera at the QR code to instantly start direct APK installation.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* WHY TRADING IS ON MOBILE APP */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-extrabold text-xs uppercase tracking-wider">
            ARCHITECTURAL ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-app">
            Why Live Trading Belongs Inside the Official ORIVIANT Mobile Application
          </h2>
          <p className="text-xs sm:text-sm text-app-sec">
            Our high-speed mobile architecture outperforms browser environments in five crucial performance vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Sub-10ms High-Speed WebSockets',
              icon: Zap,
              color: 'text-amber-500',
              bgColor: 'bg-amber-500/10 border-amber-500/20',
              desc: 'Direct binary WebSocket feeds bypass browser iFrame bottlenecks, providing real-time tick updates with sub-millisecond precision.'
            },
            {
              title: 'Biometric Hardware Security',
              icon: KeyRound,
              color: 'text-emerald-500',
              bgColor: 'bg-emerald-500/10 border-emerald-500/20',
              desc: 'Leverage device-level Secure Enclaves with FaceID, TouchID, and fingerprint biometrics to authorize orders and withdrawals securely.'
            },
            {
              title: 'Instant Push Notifications',
              icon: Bell,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10 border-blue-500/20',
              desc: 'Never miss price movements, liquidation alerts, copy trading executions, or security authorization requests with instant OS push notifications.'
            },
            {
              title: 'Zero Latency Order Execution',
              icon: Sparkles,
              color: 'text-purple-500',
              bgColor: 'bg-purple-500/10 border-purple-500/20',
              desc: 'Native C++ order compilation engine inside the APK eliminates JavaScript render pauses during high-volatility market events.'
            },
            {
              title: 'Offline Key Storage Vault',
              icon: ShieldCheck,
              color: 'text-cyan-500',
              bgColor: 'bg-cyan-500/10 border-cyan-500/20',
              desc: 'Private keys and session tokens are encrypted using hardware-backed Android Keystore, immune to browser extension phishing.'
            },
            {
              title: 'Seamless Mobile-First UI',
              icon: Smartphone,
              color: 'text-pink-500',
              bgColor: 'bg-pink-500/10 border-pink-500/20',
              desc: 'Custom gesture controls, 1-tap leverage sliders, order book depth heatmaps, and quick position closes designed specifically for touch.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-app">{item.title}</h3>
                <p className="text-xs text-app-sec leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct APK Download Card */}
      <div className="p-8 rounded-3xl bg-app-card border border-app shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-black text-app">Direct Android APK Package</h3>
          </div>
          <p className="text-xs text-app-sec">100% VirusTotal scanned & verified build. SHA-256 hash checksum available upon download.</p>
        </div>

        <a href="/oriviant-v1.apk" download="Oriviant-App.apk">
          <button
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Direct APK</span>
          </button>
        </a>
      </div>

    </div>
  );
};

// Helper SVG for Apple logo
function AppleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 170 170" {...props}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.09-3.52-2.9-7.58-7.7-12.18-14.4-8.81-12.83-15.11-26.68-18.91-41.56-3.8-14.88-5.7-29.28-5.7-43.2 0-16.73 4.22-30.82 12.66-42.27 8.44-11.45 19.14-17.3 32.11-17.55 5.76 0 11.96 1.48 18.59 4.45 6.64 2.97 10.95 4.45 12.95 4.45 1.63 0 5.86-1.48 12.69-4.45 6.83-2.97 12.87-4.33 18.12-4.08 14.12.98 25.1 6.09 32.94 15.33-12.28 7.42-18.3 17.65-18.06 30.7.25 10.3 4.22 18.92 11.91 25.87 7.7 6.95 16.92 10.8 27.67 11.55-2.72 8.52-6.53 17.2-11.43 26.05zM119.22 31.07c0-7.39 2.72-14.44 8.16-21.15 5.44-6.7 12.25-10.74 20.43-12.12.38 1.13.57 2.2.57 3.2 0 7.43-2.82 14.59-8.47 21.49-5.65 6.9-12.55 10.96-20.69 12.18-.13-1.13-.2-2.33-.2-3.6z" />
    </svg>
  );
}