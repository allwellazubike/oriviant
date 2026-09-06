export type ReviewCategory = 
  | 'Spot Trading'
  | 'Futures'
  | 'Copy Trading'
  | 'Deposits'
  | 'Withdrawals'
  | 'Customer Support'
  | 'Mobile App'
  | 'Demo Trading';

export type ReviewBadge = 
  | 'Verified Trader'
  | 'Elite Trader'
  | 'VIP Trader'
  | 'Top Copy Trader';

export interface PlatformReview {
  id: string;
  userName: string;
  avatar: string;
  country: string;
  flag: string;
  badge: ReviewBadge;
  rating: number;
  tradingExperience: string;
  category: ReviewCategory;
  date: string;
  title: string;
  reviewText: string;
  helpfulCount: number;
  verifiedTradeVolume?: string;
}

export interface PlatformReviewStats {
  overallRating: number;
  totalReviewsCount: number;
  activeTradersCount: string;
  totalTradesExecuted: string;
  countriesSupported: number;
  trustScore: number;
  platformUptime: string;
  customerSatisfactionPercent: number;
  ratingBreakdown: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
}
