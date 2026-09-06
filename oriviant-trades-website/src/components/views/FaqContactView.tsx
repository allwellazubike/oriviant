import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Headphones, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Search
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface FaqContactViewProps {
  onNavigate: (tab: NavigationTab) => void;
  initialTab?: 'faq' | 'contact';
}

export const FaqContactView: React.FC<FaqContactViewProps> = ({ onNavigate, initialTab = 'faq' }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>(initialTab);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('general');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqItems = [
    {
      id: 'faq-1',
      category: 'Mobile App',
      question: 'Where can I download the official ORIVIANT Mobile App?',
      answer: 'You can download the official Android APK directly from our Download App page. iOS App Store release is currently undergoing final store review and will be available shortly.'
    },
    {
      id: 'faq-2',
      category: 'Trading',
      question: 'Why are in-app trading features executed in the mobile application?',
      answer: 'ORIVIANT’s high-frequency trading matching engine utilizes native C++ binary WebSockets and hardware enclave key storage inside the Android APK for sub-10ms execution, zero slippage, and push-notification risk management.'
    },
    {
      id: 'faq-3',
      category: 'Security',
      question: 'How are my funds secured on ORIVIANT?',
      answer: 'Over 98% of all digital assets are held in geographically distributed multi-signature cold storage. We maintain a strict 1:1 Proof of Reserves ratio with cryptographic Merkle Tree proof verifiable by users anytime.'
    },
    {
      id: 'faq-4',
      category: 'Fees',
      question: 'What are ORIVIANT trading and withdrawal fees?',
      answer: 'Spot trading maker fees start at 0.08% and taker fees at 0.10%. Futures contract maker fees are 0.02% and taker fees 0.04%. Deposits are 100% free of charge.'
    },
    {
      id: 'faq-5',
      category: 'Copy Trading',
      question: 'How does automated Copy Trading work?',
      answer: 'Copy Trading allows you to automatically replicate the portfolio positions of verified Lead Traders 1:1 in real time. You maintain full control over maximum margin allocation and personal stop-loss limits.'
    },
    {
      id: 'faq-6',
      category: 'Account',
      question: 'What happens after I register or log in on the website?',
      answer: 'If the ORIVIANT mobile application is installed on your device, logging in redirects you straight into your mobile workspace. If not installed, you will be guided to download the official APK.'
    }
  ];

  const filteredFaqs = faqItems.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) {
      alert('Please fill out all required fields.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header Tabs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-black uppercase tracking-wider mb-2">
              <Headphones className="w-3.5 h-3.5" /> Support & Knowledge Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">Help Center & FAQ</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Everything you need to know about the ORIVIANT ecosystem, security, and mobile trading.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'faq' ? 'bg-accent text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Frequently Asked Questions
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'contact' ? 'bg-accent text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'faq' ? (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-app-sec absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. mobile app, security, fees)..."
              className="w-full bg-app-card border border-app rounded-2xl pl-11 pr-4 py-3 text-xs text-app placeholder-app-sec focus:outline-none focus:border-accent shadow-sm"
            />
          </div>

          {/* Accordion List */}
          <div className="space-y-3 max-w-4xl mx-auto">
            {filteredFaqs.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-app-card border border-app overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-app-sec/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md bg-accent/10 text-accent uppercase">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-app">{item.question}</h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-app-sec shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-app-sec leading-relaxed border-t border-app/40 bg-app-sec/20">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Contact Form */
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-app-card border border-app shadow-md space-y-6">
          <div className="border-b border-app pb-4">
            <h2 className="text-xl font-black text-app">Get in Touch with ORIVIANT Support</h2>
            <p className="text-xs text-app-sec mt-1">Our dedicated team is online 24/7/365 to assist with any questions.</p>
          </div>

          {isSubmitted ? (
            <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-app">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-app-sec max-w-md mx-auto">
                Thank you, <strong>{formName}</strong>. A support agent has received your request ({formEmail}) and will reply within 15 minutes.
              </p>
              <button
                onClick={() => { setIsSubmitted(false); setFormMessage(''); }}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-app">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-app">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-app">Inquiry Subject *</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-app-sec border border-app rounded-xl px-4 py-2.5 text-xs text-app focus:outline-none focus:border-accent"
                >
                  <option value="general">General Platform Inquiry</option>
                  <option value="app">Mobile App Download / APK</option>
                  <option value="copy">Copy Trading Assistance</option>
                  <option value="security">Security & Proof of Reserves</option>
                  <option value="partnership">Institutional Partnership</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-app">Detailed Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="How can our support team assist you today?"
                  className="w-full bg-app-sec border border-app rounded-xl p-4 text-xs text-app focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-xs shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
