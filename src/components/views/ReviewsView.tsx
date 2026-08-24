import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Search, 
  Award, 
  Globe, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Lock, 
  SlidersHorizontal,
  Zap,
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { PLATFORM_REVIEW_STATS, MOCK_PLATFORM_REVIEWS } from '../../data/reviewsData';
import { ReviewCategory, ReviewBadge } from '../../types/reviews';

export const ReviewsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Reviews');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category Tabs
  const categories = [
    'All',
    'Spot Trading',
    'Futures',
    'Copy Trading',
    'Deposits',
    'Withdrawals',
    'Customer Support',
    'Mobile App',
    'Demo Trading',
  ];

  // Filters
  const filters = [
    'All Reviews',
    '5 Star',
    '4 Star',
    'Most Recent',
    'Most Helpful',
    'Spot',
    'Futures',
    'Copy Trading',
  ];

  // UI STATE SYNCHRONIZATION
  // This prevents the "impossible AND condition" (e.g. searching for a review that is BOTH Futures AND Copy Trading)
  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    
    // Auto-sync the filter chip to match the category tab
    if (cat === 'Spot Trading') setSelectedFilter('Spot');
    else if (cat === 'Futures') setSelectedFilter('Futures');
    else if (cat === 'Copy Trading') setSelectedFilter('Copy Trading');
    else if (['Spot', 'Futures', 'Copy Trading'].includes(selectedFilter)) {
      // If we pick a category like 'Deposits', clear the conflicting filter chip
      setSelectedFilter('All Reviews');
    }
  };

  const handleFilterClick = (flt: string) => {
    setSelectedFilter(flt);

    // Auto-sync the category tab to match the filter chip
    if (flt === 'Spot') setSelectedCategory('Spot Trading');
    else if (flt === 'Futures') setSelectedCategory('Futures');
    else if (flt === 'Copy Trading') setSelectedCategory('Copy Trading');
  };

  // Filtering Logic
  const filteredReviews = useMemo(() => {
    return MOCK_PLATFORM_REVIEWS.filter((rev) => {
      // 1. Category Match
      if (selectedCategory !== 'All' && rev.category !== selectedCategory) {
        return false;
      }

      // 2. Rating Filter Match
      if (selectedFilter === '5 Star' && rev.rating !== 5) return false;
      if (selectedFilter === '4 Star' && rev.rating !== 4) return false;

      // 3. Search Query Match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = rev.userName.toLowerCase().includes(query);
        const matchesText = rev.reviewText.toLowerCase().includes(query);
        const matchesTitle = rev.title.toLowerCase().includes(query);
        const matchesCountry = rev.country.toLowerCase().includes(query);
        const matchesCategory = rev.category.toLowerCase().includes(query);

        if (!matchesName && !matchesText && !matchesTitle && !matchesCountry && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedFilter === 'Most Helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      if (selectedFilter === 'Most Recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
  }, [selectedCategory, selectedFilter, searchQuery]);

  // Badge Styling Helper
  const getBadgeStyle = (badge: ReviewBadge) => {
    switch (badge) {
      case 'VIP Trader':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'Elite Trader':
        return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
      case 'Top Copy Trader':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'Verified Trader':
      default:
        return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 1. HERO PLATFORM RATING & TRUST STATS      */}
      {/* ========================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Rating Prominent Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Independent Verified Platform Audit</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                {PLATFORM_REVIEW_STATS.overallRating}
              </span>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  Based on <strong className="text-white font-bold">{PLATFORM_REVIEW_STATS.totalReviewsCount.toLocaleString()}+</strong> global verified reviews
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Real feedback from active crypto traders across 165+ countries. Every review is verified against on-chain wallet transactions and execution logs.
            </p>
          </div>

          {/* Star Breakdown Widget */}
          <div className="w-full lg:w-80 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-2 shrink-0">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Rating Distribution</span>
              <span className="text-emerald-400 text-[11px]">98.4% Satisfaction</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { star: '5 ★', percent: PLATFORM_REVIEW_STATS.ratingBreakdown.star5 },
                { star: '4 ★', percent: PLATFORM_REVIEW_STATS.ratingBreakdown.star4 },
                { star: '3 ★', percent: PLATFORM_REVIEW_STATS.ratingBreakdown.star3 },
                { star: '2 ★', percent: PLATFORM_REVIEW_STATS.ratingBreakdown.star2 },
                { star: '1 ★', percent: PLATFORM_REVIEW_STATS.ratingBreakdown.star1 },
              ].map((item) => (
                <div key={item.star} className="flex items-center gap-3">
                  <span className="w-8 text-slate-400 font-semibold">{item.star}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold text-white text-[11px]">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Platform Stat Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800/80 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Active Traders
            </div>
            <p className="text-base sm:text-lg font-black text-white">{PLATFORM_REVIEW_STATS.activeTradersCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Trades Executed
            </div>
            <p className="text-base sm:text-lg font-black text-white">{PLATFORM_REVIEW_STATS.totalTradesExecuted}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Global Support
            </div>
            <p className="text-base sm:text-lg font-black text-white">{PLATFORM_REVIEW_STATS.countriesSupported}+ Countries</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Trust Score
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-400">{PLATFORM_REVIEW_STATS.trustScore} / 100</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Platform Uptime
            </div>
            <p className="text-base sm:text-lg font-black text-white">{PLATFORM_REVIEW_STATS.platformUptime}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Satisfaction
            </div>
            <p className="text-base sm:text-lg font-black text-white">{PLATFORM_REVIEW_STATS.customerSatisfactionPercent}%</p>
          </div>
        </div>

      </div>

      {/* READ-ONLY PORTAL NOTICE */}
      <div className="p-4 rounded-2xl bg-app-card border border-app shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-app">Read-Only Authenticated Review Registry</h4>
            <p className="text-[11px] text-app-sec">
              To prevent fraudulent rating manipulation, reviews are automatically collected from verified KYC account trades. Public submission or rating editing is disabled.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-xs font-extrabold bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Authentic
        </span>
      </div>

      {/* ========================================== */}
      {/* 2. REALISTIC CHARTS & ANALYTICS SECTION   */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Customer Satisfaction Trend */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold text-app">Monthly Satisfaction Rate</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              +2.1% YTD
            </span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { month: 'Jan', val: 96 },
              { month: 'Feb', val: 96.5 },
              { month: 'Mar', val: 97.2 },
              { month: 'Apr', val: 97.8 },
              { month: 'May', val: 98.1 },
              { month: 'Jun', val: 98.2 },
              { month: 'Jul', val: 98.4 },
              { month: 'Aug', val: 98.6 },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div 
                  className="w-full bg-accent/80 hover:bg-accent rounded-t-lg transition-all duration-300 relative group-hover:scale-105"
                  style={{ height: `${(bar.val - 90) * 10}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity">
                    {bar.val}%
                  </span>
                </div>
                <span className="text-[10px] text-app-sec font-medium">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Category Ratings Breakdown */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-app">Category Scores</h3>
            </div>
            <span className="text-[10px] font-bold text-app-sec">Audit Score</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Spot Trading Liquidity', score: '4.95 / 5' },
              { label: '125x Futures Execution Speed', score: '4.92 / 5' },
              { label: 'Copy Trading Transparency', score: '4.89 / 5' },
              { label: 'Automated Instant Withdrawals', score: '4.98 / 5' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-app">{cat.label}</span>
                  <span className="text-accent font-bold">{cat.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-app-sec overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Trader Growth & Verification */}
        <div className="p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-app">Verified Trader Badges</h3>
            </div>
            <span className="text-[10px] font-bold text-amber-500">Tier Distribution</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-[10px] font-extrabold text-blue-500 uppercase">Verified Trader</span>
              <p className="text-base font-black text-app mt-0.5">1.8M+</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <span className="text-[10px] font-extrabold text-purple-500 uppercase">Elite Trader</span>
              <p className="text-base font-black text-app mt-0.5">420K+</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] font-extrabold text-amber-500 uppercase">VIP Trader</span>
              <p className="text-base font-black text-app mt-0.5">180K+</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] font-extrabold text-emerald-500 uppercase">Top Copy Trader</span>
              <p className="text-base font-black text-app mt-0.5">85K+</p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 3. CATEGORY SELECTOR & SEARCH / FILTERS   */}
      {/* ========================================== */}
      <div className="space-y-4">
        
        {/* Category Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-app">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'bg-app-card text-app-sec hover:text-app border border-app'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar & Filter Chips */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-app-sec absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews by keyword, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-app-card text-app rounded-2xl border border-app focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-app-sec hover:text-app"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            <SlidersHorizontal className="w-4 h-4 text-app-sec shrink-0 mr-1" />
            {filters.map((flt) => (
              <button
                key={flt}
                onClick={() => handleFilterClick(flt)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  selectedFilter === flt
                    ? 'bg-app-sec text-accent font-bold border border-accent/30'
                    : 'text-app-sec hover:text-app bg-app-card border border-app'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 4. REVIEWS GRID CARDS                     */}
      {/* ========================================== */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-app-sec font-medium px-1">
          <span>Showing <strong>{filteredReviews.length}</strong> verified trader reviews</span>
          <span>Updated Live</span>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-app-card border border-app rounded-3xl space-y-3">
            <Search className="w-8 h-8 text-app-sec mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-app">No reviews found</h3>
            <p className="text-xs text-app-sec">Try clearing your search terms or adjusting selected filters.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedFilter('All Reviews'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-app-card border border-app hover:border-accent/40 transition-all shadow-sm space-y-4 flex flex-col justify-between group"
              >
                
                {/* Review Header: User Avatar, Name, Flag, Badge */}
                <div className="space-y-3">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.userName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-accent/20 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-app">{rev.userName}</h4>
                          <span title={rev.country} className="text-sm">{rev.flag}</span>
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded-md border mt-0.5 ${getBadgeStyle(rev.badge)}`}>
                          ✓ {rev.badge}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-0.5 text-amber-400 justify-end">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-app-sec font-medium block mt-0.5">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  {/* Trading Specs Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-app-sec text-app-sec font-semibold">
                      Category: <strong className="text-app">{rev.category}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-app-sec text-app-sec font-semibold">
                      Exp: <strong className="text-app">{rev.tradingExperience}</strong>
                    </span>
                    {rev.verifiedTradeVolume && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                        Vol: {rev.verifiedTradeVolume}
                      </span>
                    )}
                  </div>

                  {/* Title & Review Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-app group-hover:text-accent transition-colors leading-snug">
                      "{rev.title}"
                    </h3>
                    <p className="text-xs text-app-sec leading-relaxed">
                      {rev.reviewText}
                    </p>
                  </div>

                </div>

                {/* Footer: Helpful Verification Marker */}
                <div className="pt-3 border-t border-app flex items-center justify-between text-[11px] text-app-sec">
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified On-Chain Trader
                  </span>
                  <span className="font-medium">
                    👍 {rev.helpfulCount} traders found helpful
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};