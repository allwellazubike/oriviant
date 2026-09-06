import React, { useState } from 'react';
import { X, CheckCheck, Bell, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NavigationTab } from '../../types';

interface NotificationDrawerProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const { isDrawerOpen, closeDrawer, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isDrawerOpen) return null;

  const filtered = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter !== 'all') return item.category === activeFilter;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert':
        return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'execution':
        return <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'copy':
        return <Sparkles className="w-4 h-4 text-accent shrink-0" />;
      case 'system':
        return <Shield className="w-4 h-4 text-indigo-500 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-app-sec shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center">
      
      {/* Dimmed Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
      />

      {/* ========================================================= */}
      {/* MOBILE BOTTOM SHEET (< MD)                                */}
      {/* Width: 100% of phone width, Height: 85% of screen height */}
      {/* Rounded top corners, Sticky Header & Scrollable List    */}
      {/* ========================================================= */}
      <div 
        className="relative md:hidden w-full bg-app-card border-t border-x border-app rounded-t-[28px] shadow-2xl flex flex-col h-[85vh] max-h-[85vh] z-10 animate-in slide-in-from-bottom duration-250 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drag Handle & Sticky Header */}
        <div className="bg-app-card pt-2 px-4 pb-3 border-b border-app shrink-0 z-20">
          <div className="w-12 h-1.5 bg-app-sec rounded-full mx-auto mb-2 opacity-60" />
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-app truncate">Notification Center</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-accent hover:underline px-2.5 py-1 bg-accent/10 rounded-xl transition-colors"
              >
                Mark all read
              </button>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Horizontally Scrollable Filter Chips */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2.5 overflow-x-auto border-b border-app bg-app-sec/30 no-scrollbar shrink-0">
          {['all', 'unread', 'alert', 'execution', 'copy', 'system'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize whitespace-nowrap transition-colors shrink-0 ${
                activeFilter === filter
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'bg-app-card text-app-sec hover:text-app border border-app'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Scrollable Notification Cards List */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3.5 space-y-3 pb-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-app-sec space-y-2">
              <Bell className="w-12 h-12 mx-auto opacity-30 text-app-sec" />
              <p className="text-xs font-bold text-app">No notifications found</p>
              <p className="text-[11px] text-app-sec">You are all caught up!</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markAsRead(item.id);
                  if (item.linkTab) {
                    onNavigate(item.linkTab);
                    closeDrawer();
                  }
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.read
                    ? 'bg-app-sec/20 border-app/60 opacity-80'
                    : 'bg-app-sec/70 border-accent/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-app-card border border-app shrink-0 mt-0.5 shadow-xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-extrabold text-app break-words">{item.title}</h4>
                      <span className="text-[10px] text-app-sec font-mono shrink-0 ml-auto pt-0.5">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-app-sec leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* DESKTOP DRAWER (MD & UP)                                  */}
      {/* ========================================================= */}
      <div className="hidden md:flex fixed inset-y-0 right-0 max-w-full pl-10 z-10">
        <div className="w-screen max-w-md bg-app-card border-l border-app shadow-2xl flex flex-col">
          
          {/* Desktop Header */}
          <div className="p-4 border-b border-app flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              <h2 className="text-base font-bold text-app">Notifications Center</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-accent hover:underline px-2 py-1"
              >
                Mark all read
              </button>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-app bg-app-sec/40 no-scrollbar">
            {['all', 'unread', 'alert', 'execution', 'copy', 'system'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-accent text-white font-semibold'
                    : 'bg-app-card text-app-sec hover:text-app border border-app'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-app-sec">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications found</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    if (item.linkTab) {
                      onNavigate(item.linkTab);
                      closeDrawer();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-app-sec/30 border-app opacity-80'
                      : 'bg-app-sec/80 border-accent/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-app-card border border-app shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-app truncate">{item.title}</h4>
                        <span className="text-[10px] text-app-sec shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-app-sec leading-relaxed break-words">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
