import React from 'react';
import { Home, TrendingUp, Layers, Zap, Wallet } from 'lucide-react';
import { NavigationTab } from '../../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'markets' as NavigationTab, label: 'Markets', icon: TrendingUp },
    { id: 'futures' as NavigationTab, label: 'Futures', icon: Zap, badge: '125x' },
    { id: 'spot' as NavigationTab, label: 'Spot', icon: Layers },
    { id: 'assets' as NavigationTab, label: 'Assets', icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-app-card/95 backdrop-blur-md border-t border-app pb-safe transition-colors duration-200">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                isActive
                  ? 'text-accent font-bold scale-105'
                  : 'text-app-sec hover:text-app'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-3 px-1 text-[8px] font-black bg-red-500 text-white rounded-full uppercase">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-full animate-in fade-in duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
