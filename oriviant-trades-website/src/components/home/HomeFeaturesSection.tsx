import React from 'react';
import { 
  CreditCard, 
  ArrowDownCircle, 
  BarChart3, 
  Sliders, 
  LineChart, 
  Bot, 
  LayoutGrid, 
  Sparkles,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface HomeFeaturesSectionProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeFeaturesSection: React.FC<HomeFeaturesSectionProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'deposit',
      mainIcon: <CreditCard className="w-12 h-12 text-cyan-400" />,
      title: 'Deposit Your Way',
      desc: 'Fund your account instantly with flexible payment methods across fiat and crypto with zero hidden fees.',
      subIcons: [
        { icon: <CreditCard className="w-4 h-4 text-cyan-400" />, label: 'Card' },
        { icon: <ArrowDownCircle className="w-4 h-4 text-blue-400" />, label: 'Crypto' },
        { icon: <Globe className="w-4 h-4 text-emerald-400" />, label: 'Bank' },
      ],
    },
    {
      id: 'trading',
      mainIcon: <BarChart3 className="w-12 h-12 text-blue-400" />,
      title: 'Effortless Crypto Trading',
      desc: 'Execute spot, perpetual futures, and options trades with sub-10ms matching latency and ultra-deep liquidity.',
      subIcons: [
        { icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, label: 'Spot' },
        { icon: <LineChart className="w-4 h-4 text-blue-400" />, label: 'Futures' },
        { icon: <Sliders className="w-4 h-4 text-indigo-400" />, label: 'Orders' },
        { icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />, label: 'Grid' },
      ],
    },
    {
      id: 'toolkit',
      mainIcon: <Bot className="w-12 h-12 text-indigo-400" />,
      title: 'Your Trading Toolkit',
      desc: 'Analyze market momentum using professional chart indicators, AI trading bots, and real-time order flow depth.',
      subIcons: [
        { icon: <BarChart3 className="w-4 h-4 text-cyan-400" />, label: 'Indicators' },
        { icon: <Bot className="w-4 h-4 text-blue-400" />, label: 'Bots' },
        { icon: <Zap className="w-4 h-4 text-amber-400" />, label: 'Speed' },
      ],
    },
    {
      id: 'experience',
      mainIcon: <Sparkles className="w-12 h-12 text-cyan-300" />,
      title: 'Get More From Your Experience',
      desc: 'Unlock VIP fee tier discounts, automated copy trading rewards, 24/7 institutional support, and staking yields.',
      subIcons: [
        { icon: <Award className="w-4 h-4 text-amber-400" />, label: 'VIP' },
        { icon: <Sparkles className="w-4 h-4 text-cyan-400" />, label: 'Rewards' },
        { icon: <Globe className="w-4 h-4 text-blue-400" />, label: 'API' },
      ],
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 space-y-12 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-4xl font-black !text-white !opacity-100 tracking-tight transition-colors">
          Everything You Need To Trade
        </h2>
        <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 font-medium transition-colors">
          Institutional tools designed for effortless global market access.
        </p>
      </div>

      {/* Direct Layout on Page - No Cards, No Background Boxes, No Borders, No Shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {features.map((feat) => (
          <div
            key={feat.id}
            onClick={() => onNavigate('features')}
            className="flex flex-col items-start space-y-4 cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
          >
            {/* Large Icon directly on page (No background container) */}
            <div className="group-hover:scale-110 transition-transform duration-300">
              {feat.mainIcon}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-black !text-white !opacity-100 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400 leading-relaxed font-normal transition-colors">
                {feat.desc}
              </p>
            </div>

            {/* Small Circular Icons Underneath */}
            <div className="pt-2 flex items-center gap-2.5">
              {feat.subIcons.map((ic, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] dark:bg-[#12161c] border border-[#E4E7EC] dark:border-slate-800/80 flex items-center justify-center group-hover:border-[#1677FF] dark:group-hover:border-blue-500/40 transition-colors"
                  title={ic.label}
                >
                  {ic.icon}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

