import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LeadTrader, TraderReview } from '../types';
import { MOCK_LEAD_TRADERS } from '../mockData';
import { copyTradingApi } from '../api/copyTrading';
import { useUser } from './UserContext';

interface FollowSetting {
  traderId: string;
  subscriptionId?: string;
  allocatedUsdt: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  copyRatio: number;
}

interface CopyTradingContextType {
  traders: LeadTrader[];
  followedTraders: Record<string, FollowSetting>;
  followTrader: (traderId: string, allocation: number, stopLoss?: number) => Promise<{ success: boolean; message: string }>;
  stopCopyTrader: (traderId: string) => Promise<{ success: boolean; message: string }>;
  addReview: (traderId: string, rating: number, comment: string) => void;
  moderateReview: (reviewId: string, action: 'approved' | 'rejected') => void;
  pendingReviews: TraderReview[];
}

const CopyTradingContext = createContext<CopyTradingContextType | undefined>(undefined);

export const CopyTradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, fetchLiveWallets } = useUser();
  const [traders, setTraders] = useState<LeadTrader[]>(MOCK_LEAD_TRADERS);
  const [followedTraders, setFollowedTraders] = useState<Record<string, FollowSetting>>({});

  const fetchCopyData = useCallback(async () => {
    try {
      const res = await copyTradingApi.getLeaderboard();
      if (res.success && res.data && res.data.length > 0) {
        
        const mappedTraders: LeadTrader[] = res.data.map((t: any) => {
          const traderObj: any = {
            id: t.id.toString(),
            name: t.display_name || t.handle,
            handle: `@${t.handle}`,
            avatar: t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            roi: Number(t.roi) || (Math.random() * 50 + 10),
            winRate: Number(t.win_rate) || 85,
            aum: Number(t.base_equity) || 100000,
            followers: Number(t.followers_count) || Number(t.max_followers) || 150,
            riskScore: Number(t.risk_score) || 5,
            profitShare: (Number(t.profit_share) * 100) || 10,
            strategy: t.strategy || 'Mixed Strategy',
            badges: t.verified ? ['Verified', 'Top Trader'] : [],
            reviews: [] 
          };
          return traderObj as LeadTrader;
        });

        setTraders(mappedTraders);
      } else {
        setTraders(MOCK_LEAD_TRADERS);
      }

      if (isLoggedIn) {
        const subRes = await copyTradingApi.getMySubscriptions();
        if (subRes.success && subRes.data) {
          const mappedSubs: Record<string, FollowSetting> = {};
          subRes.data.forEach((sub: any) => {
            if (sub.status === 'ACTIVE') {
              mappedSubs[sub.trader_id.toString()] = {
                traderId: sub.trader_id.toString(),
                subscriptionId: sub.id.toString(),
                allocatedUsdt: Number(sub.allocated),
                stopLossPercent: Number(sub.stop_loss_pct) || 15,
                takeProfitPercent: Number(sub.take_profit_pct) || 50,
                copyRatio: 1.0
              };
            }
          });
          setFollowedTraders(mappedSubs);
        }
      } else {
        setFollowedTraders({});
      }
    } catch (err) {
      console.warn('Failed to fetch live copy trading data, falling back to mock data', err);
      setTraders(MOCK_LEAD_TRADERS);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCopyData();
  }, [fetchCopyData]);

  const followTrader = async (traderId: string, allocation: number, stopLoss = 15) => {
    try {
      const res = await copyTradingApi.startCopying({
        master_trader_id: traderId,
        allocation_amount: allocation,
        leverage_mode: 'PROPORTIONAL',
        stop_loss_pct: stopLoss
      });

      if (res.success) {
        await fetchCopyData();
        await fetchLiveWallets(); // Refresh wallet to reflect deducted allocation
        return { success: true, message: 'Successfully subscribed to trader' };
      }
      return { success: false, message: res.message || 'Failed to subscribe to trader' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error executing copy trade subscription' };
    }
  };

  const stopCopyTrader = async (traderId: string) => {
    const sub = followedTraders[traderId];
    
    if (!sub || !sub.subscriptionId) {
      setFollowedTraders((prev) => {
        const copy = { ...prev };
        delete copy[traderId];
        return copy;
      });
      setTraders((prev) => prev.map((t) => (t.id === traderId ? { ...t, followers: Math.max(0, t.followers - 1) } : t)));
      return { success: true, message: 'Stopped copying trader' };
    }

    try {
      const res = await copyTradingApi.stopCopying(sub.subscriptionId);
      if (res.success) {
        await fetchCopyData();
        await fetchLiveWallets(); // Refresh wallet to reflect returned funds
        return { success: true, message: 'Unsubscribed successfully' };
      }
      return { success: false, message: res.message || 'Failed to unsubscribe' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error processing unsubscription' };
    }
  };

  const addReview = (traderId: string, rating: number, comment: string) => {
    const newRev: any = {
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
          return { ...t, reviews: [newRev, ...(t.reviews || [])] };
        }
        return t;
      })
    );
  };

  const moderateReview = (reviewId: string, action: 'approved' | 'rejected') => {
    setTraders((prev) =>
      prev.map((t) => ({
        ...t,
        reviews: (t.reviews || []).map((r) => (r.id === reviewId ? { ...r, status: action as any } : r))
      }))
    );
  };

  const pendingReviews: TraderReview[] = traders
    .flatMap((t) => t.reviews || [])
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