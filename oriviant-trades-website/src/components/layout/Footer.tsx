import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Twitter,
  Send,
  MessageCircle,
  Share2
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface FooterProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <footer className="bg-app-card border-t border-app text-app pt-12 pb-24 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Promotional App Download Strip */}
        <div className="p-6 rounded-3xl bg-app-sec border border-app text-app flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-500 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-app">Get the Official ORIVIANT Mobile App</h4>
              <p className="text-xs text-app-sec">Access live spot & futures trading, sub-10ms execution, and instant mobile alerts.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install'}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
          </div>
        </div>

        {/* Main Footer Accordions on Mobile / Grid on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-400">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-app">ORIVIANT</span>
                <p className="text-[9px] text-app-sec font-medium tracking-wide">Trade • Invest • Grow</p>
              </div>
            </div>

            <p className="text-xs text-app-sec leading-relaxed max-w-sm">
              The official ORIVIANT multi-asset trading platform. Providing institutional liquidity, 1:1 proof of reserves, and global market coverage across 165+ countries.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2 text-app-sec">
              <a href="#twitter" className="w-8 h-8 rounded-xl bg-app-sec border border-app flex items-center justify-center hover:text-cyan-500 hover:border-blue-500/40 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#telegram" className="w-8 h-8 rounded-xl bg-app-sec border border-app flex items-center justify-center hover:text-cyan-500 hover:border-blue-500/40 transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href="#discord" className="w-8 h-8 rounded-xl bg-app-sec border border-app flex items-center justify-center hover:text-cyan-500 hover:border-blue-500/40 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-xl bg-app-sec border border-app flex items-center justify-center hover:text-cyan-500 hover:border-blue-500/40 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 pt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Proof of Reserves Verified</span>
            </div>
          </div>

          {/* About Accordion Column */}
          <div className="border-b md:border-b-0 border-app pb-4 md:pb-0">
            <button
              onClick={() => toggleAccordion('about')}
              className="w-full flex items-center justify-between text-xs font-black text-app uppercase tracking-wider md:cursor-default"
            >
              <span>About</span>
              <span className="md:hidden">
                {openAccordion === 'about' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <ul className={`mt-3 space-y-2 text-xs text-app-sec font-medium ${openAccordion === 'about' ? 'block' : 'hidden md:block'}`}>
              <li><button onClick={() => onNavigate('about')} className="hover:text-cyan-500 transition-colors cursor-pointer">About ORIVIANT</button></li>
              <li><button onClick={() => onNavigate('security')} className="hover:text-cyan-500 transition-colors cursor-pointer">Proof of Reserves</button></li>
              <li><button onClick={() => onNavigate('security')} className="hover:text-cyan-500 transition-colors cursor-pointer">Security Architecture</button></li>
              <li><button onClick={() => onNavigate('reviews')} className="hover:text-cyan-500 transition-colors cursor-pointer">Verified Reviews</button></li>
            </ul>
          </div>

          {/* Services Accordion Column */}
          <div className="border-b md:border-b-0 border-app pb-4 md:pb-0">
            <button
              onClick={() => toggleAccordion('services')}
              className="w-full flex items-center justify-between text-xs font-black text-app uppercase tracking-wider md:cursor-default"
            >
              <span>Services</span>
              <span className="md:hidden">
                {openAccordion === 'services' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <ul className={`mt-3 space-y-2 text-xs text-app-sec font-medium ${openAccordion === 'services' ? 'block' : 'hidden md:block'}`}>
              <li><button onClick={() => onNavigate('markets')} className="hover:text-cyan-500 transition-colors cursor-pointer">Spot & Futures</button></li>
              <li><button onClick={() => onNavigate('markets')} className="hover:text-cyan-500 transition-colors cursor-pointer">Forex Trading</button></li>
              <li><button onClick={() => onNavigate('markets')} className="hover:text-cyan-500 transition-colors cursor-pointer">Global Equities</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-cyan-500 transition-colors cursor-pointer">Trading Engine API</button></li>
            </ul>
          </div>

          {/* Apps & Support Accordion Column */}
          <div className="pb-4 md:pb-0">
            <button
              onClick={() => toggleAccordion('support')}
              className="w-full flex items-center justify-between text-xs font-black text-app uppercase tracking-wider md:cursor-default"
            >
              <span>Apps & Support</span>
              <span className="md:hidden">
                {openAccordion === 'support' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <ul className={`mt-3 space-y-2 text-xs text-app-sec font-medium ${openAccordion === 'support' ? 'block' : 'hidden md:block'}`}>
              <li><button onClick={() => window.location.href = 'https://oriviant-mu.vercel.app/?prompt=install'} className="hover:text-cyan-500 transition-colors cursor-pointer">Download Android APK</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-cyan-500 transition-colors cursor-pointer">Help Center & FAQ</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-cyan-500 transition-colors cursor-pointer">24/7 VIP Support</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-cyan-500 transition-colors cursor-pointer">Terms of Service</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Risk Warning & Copyright Bar */}
        <div className="pt-8 border-t border-app space-y-4 text-[11px] text-app-sec leading-relaxed">
          <p>
            <strong>Risk Disclosure:</strong> Financial trading in cryptocurrencies, foreign exchange, commodities, and derivatives involves substantial risk of loss and is not suitable for all investors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-app/50 font-medium">
            <span>© 2026 ORIVIANT.com. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span>English (US)</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};