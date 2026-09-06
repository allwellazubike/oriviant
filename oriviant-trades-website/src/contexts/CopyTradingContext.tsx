import React, { createContext, useContext, useState } from 'react';
import { LeadTrader, TraderReview } from '../types';
import { MOCK_LEAD_TRADERS } from '../mockData';

interface FollowSetting {
  traderId: string;
  allocatedUsdt: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  copyRatio: number;
}

interface CopyTradingContextType {
  traders: LeadTrader[];
  followedTraders: Record<string, FollowSetting>;
  followTrader: (traderId: string, allocation: number, stopLoss?: number) => void;
  stopCopyTrader: (traderId: string) => void;
  addReview: (traderId: string, rating: number, comment: string) => void;
  moderateReview: (reviewId: string, action: 'approved' | 'rejected') => void;
  pendingReviews: TraderReview[];
}

const CopyTradingContext = createContext<CopyTradingContextType | undefined>(undefined);

export const CopyTradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [traders, setTraders] = useState<LeadTrader[]>(MOCK_LEAD_TRADERS);
  const [followedTraders, setFollowedTraders] = useState<Record<string, FollowSetting>>({
    'trader-1': { traderId: 'trader-1', allocatedUsdt: 5000, stopLossPercent: 15, takeProfitPercent: 50, copyRatio: 1.0 }
  });

  const followTrader = (traderId: string, allocation: number, stopLoss = 15) => {
    setFollowedTraders((prev) => ({
      ...prev,
      [traderId]: {
        traderId,
        allocatedUsdt: allocation,
        stopLossPercent: stopLoss,
        takeProfitPercent: 50,
        copyRatio: 1.0
      }
    }));

    setTraders((prev) =>
      prev.map((t) => (t.id === traderId ? { ...t, followers: t.followers + 1 } : t))
    );
  };

  const stopCopyTrader = (traderId: string) => {
    setFollowedTraders((prev) => {
      const copy = { ...prev };
      delete copy[traderId];
      return copy;
    });

    setTraders((prev) =>
      prev.map((t) => (t.id === traderId ? { ...t, followers: Math.max(0, t.followers - 1) } : t))
    );
  };

  const addReview = (traderId: string, rating: number, comment: string) => {
    const newRev: TraderReview = {
      id: `rev-${Date.now()}`,
      traderId,
      copierName: 'You (Copier)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      rating,
      comment,
      roi: 32.4,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 1,
      verifiedCopier: true,
      status: 'approved'
    };

    setTraders((prev) =>
      prev.map((t) => {
        if (t.id === traderId) {
          return { ...t, reviews: [newRev, ...t.reviews] };
        }
        return t;
      })
    );
  };

  const moderateReview = (reviewId: string, action: 'approved' | 'rejected') => {
    setTraders((prev) =>
      prev.map((t) => ({
        ...t,
        reviews: t.reviews.map((r) => (r.id === reviewId ? { ...r, status: action } : r))
      }))
    );
  };

  const pendingReviews: TraderReview[] = traders
    .flatMap((t) => t.reviews)
    .filter((r) => r.status === 'pending');

  return (
    <CopyTradingContext.Provider
      value={{
        traders,
        followedTraders,
        followTrader,
        stopCopyTrader,
        addReview,
        moderateReview,
        pendingReviews
      }}
    >
      {children}
    </CopyTradingContext.Provider>
  );
};

export const useCopyTrading = () => {
  const context = useContext(CopyTradingContext);
  if (!context) {
    throw new Error('useCopyTrading must be used within a CopyTradingProvider');
  }
  return context;
};
