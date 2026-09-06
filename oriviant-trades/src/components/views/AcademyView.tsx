import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Award, 
  Search, 
  Play, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  BarChart2,
  SlidersHorizontal,
  X,
  FileDown,
  Layers,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

import { 
  ACADEMY_LESSONS, 
  INITIAL_USER_ACADEMY_PROGRESS, 
  MOCK_DAILY_LEARNING
} from '../../data/academyData';
import { 
  CourseLevel, 
  AcademyLesson, 
  UserAcademyProgress
} from '../../types/academy';

import { academyApi } from '../../api/academy';
import { QuizEngine } from '../academy/QuizEngine';
import { PracticeSimulation } from '../academy/PracticeSimulation';
import { DailyLearningWidget } from '../academy/DailyLearningWidget';

export const AcademyView: React.FC = () => {
  // Live Database State
  const [userProgress, setUserProgress] = useState<UserAcademyProgress>(INITIAL_USER_ACADEMY_PROGRESS);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);

  // Active Path Tab
  const [activePath, setActivePath] = useState<CourseLevel>('Beginner');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  // Active Lesson Reader Modal
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);

  // Active Interactive Modals
  const [activeQuizLesson, setActiveQuizLesson] = useState<AcademyLesson | null>(null);
  const [activePracticeLesson, setActivePracticeLesson] = useState<AcademyLesson | null>(null);
  const [isDailyQuizOpen, setIsDailyQuizOpen] = useState<boolean>(false);

  // Dev Unlock All Toggle (For instant evaluator testing)
  const [unlockAll, setUnlockAll] = useState<boolean>(false);

  // 1. Fetch Initial Progress from PostgreSQL
  useEffect(() => {
    let mounted = true;
    const loadProgress = async () => {
      try {
        const res = await academyApi.getProgress();
        if (res.success && res.data && mounted) {
          setUserProgress(res.data);
        }
      } catch (err) {
        console.error('Failed to load live academy progress', err);
      } finally {
        if (mounted) setIsLoadingProgress(false);
      }
    };
    loadProgress();
    return () => { mounted = false; };
  }, []);

  // 2. Auto-sync progress to PostgreSQL whenever it changes
  useEffect(() => {
    if (!isLoadingProgress) {
      academyApi.saveProgress(userProgress).catch(err => {
        console.error('Failed to sync progress to database:', err);
      });
    }
  }, [userProgress, isLoadingProgress]);

  // Lessons for current path
  const currentPathLessons = useMemo(() => {
    return ACADEMY_LESSONS.filter((l) => l.path === activePath);
  }, [activePath]);

  // Topics list for current path filter dropdown
  const pathTopics = useMemo(() => {
    const set = new Set<string>();
    currentPathLessons.forEach((l) => set.add(l.topic));
    return ['all', ...Array.from(set)];
  }, [currentPathLessons]);

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    return currentPathLessons.filter((l) => {
      // Media type
      if (selectedMediaType !== 'all' && l.mediaType !== selectedMediaType) return false;
      
      // Topic
      if (selectedTopicFilter !== 'all' && l.topic !== selectedTopicFilter) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchTopic = l.topic.toLowerCase().includes(q);
        const matchSummary = l.summary.toLowerCase().includes(q);
        const matchKeyTakeaways = l.keyTakeaways.some((k) => k.toLowerCase().includes(q));

        if (!matchTitle && !matchTopic && !matchSummary && !matchKeyTakeaways) {
          return false;
        }
      }

      return true;
    });
  }, [currentPathLessons, selectedMediaType, selectedTopicFilter, searchQuery]);

  // Path Completion Percentages
  const pathStats = useMemo(() => {
    const totalBeg = ACADEMY_LESSONS.filter((l) => l.path === 'Beginner').length;
    const totalInt = ACADEMY_LESSONS.filter((l) => l.path === 'Intermediate').length;
    const totalAdv = ACADEMY_LESSONS.filter((l) => l.path === 'Advanced').length;

    const compBeg = ACADEMY_LESSONS.filter((l) => l.path === 'Beginner' && userProgress.completedLessonIds.includes(l.id)).length;
    const compInt = ACADEMY_LESSONS.filter((l) => l.path === 'Intermediate' && userProgress.completedLessonIds.includes(l.id)).length;
    const compAdv = ACADEMY_LESSONS.filter((l) => l.path === 'Advanced' && userProgress.completedLessonIds.includes(l.id)).length;

    return {
      Beginner: { total: totalBeg, completed: compBeg, percent: Math.round((compBeg / totalBeg) * 100) },
      Intermediate: { total: totalInt, completed: compInt, percent: Math.round((compInt / totalInt) * 100) },
      Advanced: { total: totalAdv, completed: compAdv, percent: Math.round((compAdv / totalAdv) * 100) },
    };
  }, [userProgress]);

  // Average Quiz Score
  const averageQuizScore = useMemo(() => {
    const scores: number[] = Object.values(userProgress.quizScores);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a: number, b: number) => a + b, 0);
    return Math.round(sum / scores.length);
  }, [userProgress.quizScores]);

  // Sequential Unlock Helper
  const isLessonUnlocked = (lesson: AcademyLesson) => {
    if (unlockAll) return true;
    if (lesson.lessonNumber === 1) return true;

    // Check if previous lesson in same path is completed
    const prevLesson = ACADEMY_LESSONS.find(
      (l) => l.path === lesson.path && l.lessonNumber === lesson.lessonNumber - 1
    );

    if (!prevLesson) return true;
    return userProgress.completedLessonIds.includes(prevLesson.id);
  };

  // Lesson Completion Handler
  const handleMarkLessonComplete = (lessonId: string) => {
    if (!userProgress.completedLessonIds.includes(lessonId)) {
      setUserProgress((prev) => ({
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        totalLearningMinutes: prev.totalLearningMinutes + 15,
        xpPoints: prev.xpPoints + 150,
      }));
    }
  };

  // Quiz Completion Handler
  const handleQuizCompleted = (lessonId: string, scorePercentage: number) => {
    setUserProgress((prev) => {
      const updatedScores = { ...prev.quizScores, [lessonId]: scorePercentage };
      const newCompleted = scorePercentage >= 70 && !prev.completedLessonIds.includes(lessonId)
        ? [...prev.completedLessonIds, lessonId]
        : prev.completedLessonIds;

      return {
        ...prev,
        quizScores: updatedScores,
        completedLessonIds: newCompleted,
        xpPoints: prev.xpPoints + (scorePercentage >= 70 ? 200 : 50),
      };
    });
  };

  if (isLoadingProgress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-app-sec space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm font-bold tracking-wider uppercase">Loading Academy Progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 1. ACADEMY HERO HEADER & LEARNING METRICS  */}
      {/* ========================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow Background */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Oriviant Trading Academy
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Complete Crypto & Derivatives Education Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Master cryptocurrency trading from beginner fundamentals to advanced institutional Smart Money Concepts (SMC), order blocks, and algorithmic risk management.
            </p>
          </div>

          {/* User Level Badge & XP Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3 shrink-0 w-full sm:w-72">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Level</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚡ {userProgress.xpPoints} XP
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  {userProgress.completedLessonIds.length >= 26 ? 'Advanced Scholar' : userProgress.completedLessonIds.length >= 13 ? 'Intermediate Trader' : 'Beginner Scholar'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {userProgress.completedLessonIds.length} / {ACADEMY_LESSONS.length} Lessons Completed
                </p>
              </div>
            </div>

            {/* Quick Demo Unlock Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Sequential Lock:</span>
              <button
                onClick={() => setUnlockAll(!unlockAll)}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  unlockAll ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {unlockAll ? 'Unlocked All' : 'Enforce Order'}
              </button>
            </div>
          </div>

        </div>

        {/* User Progress Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 relative z-10 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Lessons</span>
            <p className="text-base sm:text-lg font-black text-white">
              {userProgress.completedLessonIds.length} <span className="text-slate-500 text-xs">/ 39</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Quiz Accuracy</span>
            <p className="text-base sm:text-lg font-black text-emerald-400">{averageQuizScore}% Avg</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Study Time</span>
            <p className="text-base sm:text-lg font-black text-white">{(userProgress.totalLearningMinutes / 60).toFixed(1)} Hours</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Streak</span>
            <p className="text-base sm:text-lg font-black text-amber-400">
              🔥 {userProgress.dailyStreak} Days
            </p>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 2. DAILY LEARNING HUB WIDGET               */}
      {/* ========================================== */}
      <DailyLearningWidget
        dailyData={MOCK_DAILY_LEARNING}
        onOpenDailyQuiz={() => setIsDailyQuizOpen(true)}
      />

      {/* ========================================== */}
      {/* 3. THREE LEARNING PATHS SELECTOR           */}
      {/* ========================================== */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-app flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" /> Select Your Structured Learning Path
          </h2>
          <span className="text-xs text-app-sec">3 Comprehensive Paths • 39 Lessons</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Path 1: Beginner */}
          <button
            onClick={() => setActivePath('Beginner')}
            className={`p-5 rounded-3xl text-left border transition-all space-y-3 relative overflow-hidden ${
              activePath === 'Beginner'
                ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-app-card border-app hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs">
                🟢 Beginner Path
              </span>
              <span className="text-xs font-bold text-emerald-500">
                {pathStats.Beginner.percent}% Complete
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-app">Crypto & Orderbook Essentials</h3>
              <p className="text-xs text-app-sec mt-1">
                Blockchain basics, spot trading, perpetual futures, leverage, long/short & risk limits.
              </p>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-app-sec overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pathStats.Beginner.percent}%` }} />
              </div>
              <span className="text-[10px] text-app-sec font-medium">
                {pathStats.Beginner.completed} of {pathStats.Beginner.total} Lessons Completed
              </span>
            </div>
          </button>

          {/* Path 2: Intermediate */}
          <button
            onClick={() => setActivePath('Intermediate')}
            className={`p-5 rounded-3xl text-left border transition-all space-y-3 relative overflow-hidden ${
              activePath === 'Intermediate'
                ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-app-card border-app hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs">
                🟡 Intermediate Path
              </span>
              <span className="text-xs font-bold text-amber-500">
                {pathStats.Intermediate.percent}% Complete
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-app">Technical Analysis & Indicators</h3>
              <p className="text-xs text-app-sec mt-1">
                Support & resistance, chart patterns, RSI, MACD, Bollinger Bands, Fibs & Swing setups.
              </p>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-app-sec overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pathStats.Intermediate.percent}%` }} />
              </div>
              <span className="text-[10px] text-app-sec font-medium">
                {pathStats.Intermediate.completed} of {pathStats.Intermediate.total} Lessons Completed
              </span>
            </div>
          </button>

          {/* Path 3: Advanced */}
          <button
            onClick={() => setActivePath('Advanced')}
            className={`p-5 rounded-3xl text-left border transition-all space-y-3 relative overflow-hidden ${
              activePath === 'Advanced'
                ? 'bg-red-500/10 border-red-500 shadow-md shadow-red-500/10'
                : 'bg-app-card border-app hover:border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-500 text-white font-black text-xs">
                🔴 Advanced Path
              </span>
              <span className="text-xs font-bold text-red-500">
                {pathStats.Advanced.percent}% Complete
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-app">Smart Money Concepts & Order Blocks</h3>
              <p className="text-xs text-app-sec mt-1">
                Institutional liquidity sweeps, Order Blocks, FVGs, Wyckoff, ICT concepts & Algo trading.
              </p>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-app-sec overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${pathStats.Advanced.percent}%` }} />
              </div>
              <span className="text-[10px] text-app-sec font-medium">
                {pathStats.Advanced.completed} of {pathStats.Advanced.total} Lessons Completed
              </span>
            </div>
          </button>

        </div>

      </div>

      {/* ========================================== */}
      {/* 4. SEARCH & FILTERS IN ACADEMY             */}
      {/* ========================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-app-card border border-app">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activePath} lessons...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-app-sec text-app rounded-xl border border-app focus:outline-none focus:border-accent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          
          {/* Media Type Filter */}
          <select
            value={selectedMediaType}
            onChange={(e) => setSelectedMediaType(e.target.value)}
            className="py-2 px-3 text-xs bg-app-sec text-app rounded-xl border border-app focus:outline-none"
          >
            <option value="all">All Content Types</option>
            <option value="article">Articles</option>
            <option value="video">Video Lessons</option>
            <option value="infographic">Infographics</option>
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-app-sec text-app rounded-xl border border-app focus:outline-none capitalize"
          >
            <option value="all">All Topics</option>
            {pathTopics.filter((t) => t !== 'all').map((top) => (
              <option key={top} value={top}>{top}</option>
            ))}
          </select>

        </div>

      </div>

      {/* ========================================== */}
      {/* 5. LESSONS GRID CARDS                     */}
      {/* ========================================== */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-app-sec font-medium px-1">
          <span>Showing <strong>{filteredLessons.length}</strong> lessons for {activePath} Path</span>
          <span>{pathStats[activePath].completed} / {pathStats[activePath].total} Completed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const isCompleted = userProgress.completedLessonIds.includes(lesson.id);
            const unlocked = isLessonUnlocked(lesson);
            const quizScore = userProgress.quizScores[lesson.id];

            return (
              <div
                key={lesson.id}
                className={`p-6 rounded-3xl border transition-all shadow-sm space-y-4 flex flex-col justify-between group ${
                  !unlocked
                    ? 'bg-app-card/60 border-app opacity-75 grayscale-[20%]'
                    : isCompleted
                      ? 'bg-app-card border-emerald-500/30'
                      : 'bg-app-card border-app hover:border-accent/50'
                }`}
              >
                
                {/* Header */}
                <div className="space-y-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-accent/10 text-accent uppercase">
                      Lesson #{lesson.lessonNumber} • {lesson.topic}
                    </span>

                    {/* Completion Status Badge */}
                    {isCompleted ? (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : !unlocked ? (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-app-sec text-app-sec flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/20">
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-app group-hover:text-accent transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-app-sec line-clamp-2 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-sec">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {lesson.estimatedDuration}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-app">
                      {lesson.mediaType === 'video' ? '🎬 Video' : lesson.mediaType === 'infographic' ? '📊 Infographic' : '📄 Article'}
                    </span>
                    {lesson.pdfResource && (
                      <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                        <FileDown className="w-3 h-3" /> PDF
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-app space-y-2">
                  
                  {unlocked ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className="flex-1 py-2.5 rounded-xl bg-accent text-white font-extrabold text-xs shadow-md shadow-accent/20 hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Start Lesson
                      </button>

                      <button
                        onClick={() => setActiveQuizLesson(lesson)}
                        className="px-3 py-2.5 rounded-xl bg-app-sec text-app hover:text-accent font-bold text-xs border border-app transition-colors flex items-center gap-1"
                        title="Take Lesson Quiz"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quiz</span>
                      </button>

                      {lesson.practiceMode && (
                        <button
                          onClick={() => setActivePracticeLesson(lesson)}
                          className="px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold text-xs border border-emerald-500/20 transition-colors flex items-center gap-1"
                          title="Practice Demo Mode"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Sim</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-app-sec text-app-sec font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Complete Previous Lesson First
                    </button>
                  )}

                  {quizScore !== undefined && (
                    <div className="text-[10px] text-right font-bold text-app-sec">
                      Best Quiz Score: <span className={quizScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}>{quizScore}%</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================== */}
      {/* 6. LESSON CONTENT READER MODAL             */}
      {/* ========================================== */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-app-card border border-app rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-app pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                  {activeLesson.path} • Lesson #{activeLesson.lessonNumber} • {activeLesson.topic}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-app mt-2">{activeLesson.title}</h2>
              </div>
              <button 
                onClick={() => setActiveLesson(null)} 
                className="p-2 rounded-xl bg-app-sec text-app-sec hover:text-app"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Placeholder or Embedded Video */}
            {activeLesson.mediaType === 'video' && (
              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-app group">
                <div className="text-center space-y-2 p-6">
                  <div className="w-16 h-16 rounded-full bg-accent text-white mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Interactive Video Stream: {activeLesson.title}</h4>
                  <p className="text-[10px] text-slate-400">00:00 / {activeLesson.estimatedDuration}</p>
                </div>
              </div>
            )}

            {/* Sections Content */}
            <div className="space-y-6 text-xs sm:text-sm text-app-sec leading-relaxed">
              {activeLesson.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-app">{sec.heading}</h3>
                  <p>{sec.body}</p>
                  
                  {sec.keyPoints && (
                    <ul className="space-y-1 list-disc pl-5 pt-1 text-app-sec">
                      {sec.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx}>{kp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Key Takeaways Card */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <h4 className="font-extrabold text-xs text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Key Lesson Takeaways
              </h4>
              <ul className="space-y-1 text-xs text-app-sec list-disc pl-5">
                {activeLesson.keyTakeaways.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Downloadable PDF Cheatsheet */}
            {activeLesson.pdfResource && (
              <div className="p-4 rounded-2xl bg-app-sec border border-app flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-accent" />
                  <div>
                    <h5 className="font-bold text-app">{activeLesson.pdfResource.title}</h5>
                    <span className="text-[10px] text-app-sec">{activeLesson.pdfResource.size} PDF Cheatsheet</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Downloading ${activeLesson.pdfResource?.title}...`)}
                  className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs"
                >
                  Download
                </button>
              </div>
            )}

            {/* Footer Action Bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-app">
              <button
                onClick={() => {
                  handleMarkLessonComplete(activeLesson.id);
                  setActiveLesson(null);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20"
              >
                ✓ Mark Completed & Continue
              </button>

              <button
                onClick={() => {
                  const lesson = activeLesson;
                  setActiveLesson(null);
                  setActiveQuizLesson(lesson);
                }}
                className="px-6 py-3.5 rounded-2xl bg-accent text-white font-extrabold text-xs shadow-lg shadow-accent/20"
              >
                Take Lesson Quiz
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 8. QUIZ ENGINE MODAL                       */}
      {/* ========================================== */}
      {activeQuizLesson && (
        <QuizEngine
          lessonTitle={activeQuizLesson.title}
          questions={activeQuizLesson.quiz}
          onQuizCompleted={(score) => handleQuizCompleted(activeQuizLesson.id, score)}
          onClose={() => setActiveQuizLesson(null)}
        />
      )}

      {/* ========================================== */}
      {/* 9. PRACTICE SIMULATION MODAL              */}
      {/* ========================================== */}
      {activePracticeLesson && activePracticeLesson.practiceMode && (
        <PracticeSimulation
          scenario={activePracticeLesson.practiceMode}
          onCompleted={(scenId) => {
            if (!userProgress.practiceScenariosCompleted.includes(scenId)) {
              setUserProgress((prev) => ({
                ...prev,
                practiceScenariosCompleted: [...prev.practiceScenariosCompleted, scenId],
                xpPoints: prev.xpPoints + 100,
              }));
            }
          }}
          onClose={() => setActivePracticeLesson(null)}
        />
      )}

      {/* ========================================== */}
      {/* 10. DAILY SPEED QUIZ MODAL                */}
      {/* ========================================== */}
      {isDailyQuizOpen && (
        <QuizEngine
          lessonTitle="Daily Speed Refresher Quiz"
          questions={MOCK_DAILY_LEARNING.dailyQuiz}
          onQuizCompleted={(score) => {
            setUserProgress((prev) => ({ ...prev, xpPoints: prev.xpPoints + 100 }));
          }}
          onClose={() => setIsDailyQuizOpen(false)}
        />
      )}

    </div>
  );
};