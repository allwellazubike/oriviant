import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, Send, Sparkles, X, ShieldAlert, Check } from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am Oriviant AI Support. How can I assist with your trading account or demo balance today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    {
      q: 'How does the $10,000 USDT Demo Balance work?',
      a: 'Every Oriviant account receives $10,000 in virtual funds upon registration. You can practice spot trading or 125x perp futures with 1:1 real orderbook depth. You can refill demo balance anytime from the header or Demo Workspace.'
    },
    {
      q: 'What is the difference between Isolated and Cross Margin in Futures?',
      a: 'Isolated margin locks a fixed collateral amount strictly to a single open position to cap max loss. Cross margin shares your entire futures wallet collateral across all active open positions.'
    },
    {
      q: 'How does Copy Trading automated execution work?',
      a: 'When you copy a Lead Trader, Oriviant automatically replicates every position opened by the lead trader 1:1 in your account, adjusted proportionally to your allocated capital.'
    },
    {
      q: 'Is 2FA required for withdrawals?',
      a: 'Yes, Google Authenticator or SMS OTP 2FA is strictly mandatory for all live asset withdrawals to safeguard user capital.'
    }
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for your inquiry about "${userText}". Our support desk and risk engine are monitoring all systems. Demo funds can be refilled anytime risk-free!`
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-app-card border border-app shadow-md space-y-3">
        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold inline-flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> 24/7 CUSTOMER SUPPORT & FAQS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-app">How Can We Help You Today?</h1>
        <p className="text-xs text-app-sec">Find instant answers to trading questions or chat with Oriviant AI Assistant.</p>

        <button
          onClick={() => setIsChatOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-md shadow-accent/20 transition-all flex items-center gap-2 mt-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Launch Oriviant AI Live Support Chat</span>
        </button>
      </div>

      {/* FAQs Accordion */}
      <div className="p-5 rounded-2xl bg-app-card border border-app shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-app">Frequently Asked Questions</h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-app rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs text-app bg-app-sec/40 hover:bg-app-sec/80 flex items-center justify-between transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-app-sec transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="p-4 text-xs text-app-sec leading-relaxed bg-app-card border-t border-app">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live AI Assistant Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-app-card border border-app rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
            <div className="p-4 border-b border-app bg-app-sec flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span className="font-extrabold text-sm text-app">Oriviant AI Support Desk</span>
              </div>
              <button onClick={() => setIsChatOpen(false)}>
                <X className="w-5 h-5 text-app-sec" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-app-card">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-accent text-white font-medium rounded-tr-none'
                        : 'bg-app-sec text-app border border-app rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-app flex items-center gap-2 bg-app-sec">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about deposits, leverage, or demo balance..."
                className="flex-1 bg-app-card border border-app rounded-xl px-3 py-2 text-xs text-app focus:outline-none"
              />
              <button type="submit" className="p-2 rounded-xl bg-accent text-white">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
