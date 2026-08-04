import React, { useState } from 'react';
import { Sparkles, BookOpen, Quote, Trophy, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { DailyLearningState } from '../../types/academy';

interface DailyLearningWidgetProps {
  dailyData: DailyLearningState;
  onOpenDailyQuiz: () => void;
}

export const DailyLearningWidget: React.FC<DailyLearningWidgetProps> = ({
  dailyData,
  onOpenDailyQuiz,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tip' | 'word' | 'quote' | 'challenge'>('tip');

  return (
    <div className="p-6 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-app pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-app">Daily Trading Hub</h3>
            <p className="text-[11px] text-app-sec">Daily tips, market vocabulary, wisdom & quick challenges</p>
          </div>
        </div>

        {/* Daily Speed Quiz Trigger */}
        <button
          onClick={onOpenDailyQuiz}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Daily 3-Min Quiz (+100 XP)</span>
        </button>
      </div>

      {/* Segmented Control Sub-Tabs */}
      <div className="flex items-center gap-1 bg-app-sec/50 p-1 rounded-2xl border border-app overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('tip')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'tip' ? 'bg-app-card text-accent shadow-sm' : 'text-app-sec hover:text-app'
          }`}
        >
          💡 Trading Tip
        </button>
        <button
          onClick={() => setActiveSubTab('word')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'word' ? 'bg-app-card text-emerald-500 shadow-sm' : 'text-app-sec hover:text-app'
          }`}
        >
          📖 Word of Day
        </button>
        <button
          onClick={() => setActiveSubTab('quote')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'quote' ? 'bg-app-card text-purple-500 shadow-sm' : 'text-app-sec hover:text-app'
          }`}
        >
          💬 Wisdom
        </button>
        <button
          onClick={() => setActiveSubTab('challenge')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            activeSubTab === 'challenge' ? 'bg-app-card text-amber-500 shadow-sm' : 'text-app-sec hover:text-app'
          }`}
        >
          🏆 Weekly Challenge
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 rounded-2xl bg-app-sec/30 border border-app min-h-[100px] flex items-center">
        
        {activeSubTab === 'tip' && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block">
              Category: {dailyData.dailyTip.category}
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-app">{dailyData.dailyTip.title}</h4>
            <p className="text-xs text-app-sec leading-relaxed">{dailyData.dailyTip.tip}</p>
          </div>
        )}

        {activeSubTab === 'word' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-emerald-500">{dailyData.wordOfDay.term}</h4>
              <span className="text-[11px] font-mono text-app-sec">{dailyData.wordOfDay.phonetic}</span>
            </div>
            <p className="text-xs text-app leading-relaxed">{dailyData.wordOfDay.definition}</p>
            <p className="text-[11px] text-app-sec italic bg-app-card p-2 rounded-xl border border-app mt-1">
              Example: "{dailyData.wordOfDay.example}"
            </p>
          </div>
        )}

        {activeSubTab === 'quote' && (
          <div className="space-y-2">
            <Quote className="w-5 h-5 text-purple-500 opacity-80" />
            <p className="text-xs sm:text-sm font-serif italic text-app leading-relaxed">
              "{dailyData.tradingQuote.quote}"
            </p>
            <div className="text-xs">
              <strong className="text-purple-500 font-extrabold">{dailyData.tradingQuote.author}</strong>
              <span className="text-app-sec ml-1.5">• {dailyData.tradingQuote.role}</span>
            </div>
          </div>
        )}

        {activeSubTab === 'challenge' && (
          <div className="w-full space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-app">{dailyData.weeklyChallenge.title}</h4>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                +{dailyData.weeklyChallenge.rewardXp} XP Reward
              </span>
            </div>
            <p className="text-xs text-app-sec">{dailyData.weeklyChallenge.description}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-app-sec">
                <span>Progress: {dailyData.weeklyChallenge.currentProgress} / {dailyData.weeklyChallenge.targetCount} Lessons</span>
                <span>{Math.round((dailyData.weeklyChallenge.currentProgress / dailyData.weeklyChallenge.targetCount) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-app-sec overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(dailyData.weeklyChallenge.currentProgress / dailyData.weeklyChallenge.targetCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
