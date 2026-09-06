import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LeadTrader, TraderReview } from '../types';
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
  createLeadTrader: (traderData: Partial<LeadTrader>) => Promise<{ success: boolean; message: string }>;
  editLeadTrader: (traderId: string, traderData: Partial<LeadTrader>) => Promise<{ success: boolean; message: string }>;
  deleteLeadTrader: (traderId: string) => Promise<{ success: boolean; message: string }>; 
  refreshTraders: () => Promise<void>; 
}

const CopyTradingContext = createContext<CopyTradingContextType | undefined>(undefined);

export const CopyTradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, fetchLiveWallets } = useUser();
  
  // 🔥 NO MORE FAKE DATA. Strictly relies on the database.
  const [traders, setTraders] = useState<LeadTrader[]>([]);
  const [followedTraders, setFollowedTraders] = useState<Record<string, FollowSetting>>({});

  const fetchCopyData = useCallback(async () => {
    try {
      const res = await copyTradingApi.getLeaderboard();

      if (res.success && res.data && Array.isArray(res.data)) {
        const mappedTraders: LeadTrader[] = res.data.map((t: any) => {
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.display_name || t.handle || 'Trader')}&background=random`;

          const traderObj = {
            id: t.id.toString(), // Strict 1:1 database ID mapping
            name: t.display_name || t.name || t.handle || 'Unknown Trader',
            handle: `@${(t.handle || '').replace('@', '')}`,
            avatar: t.avatar_url || t.avatar || fallbackAvatar,
            roi: Number(t.roi) || Number(t.monthlyRoi) || Number(t.monthly_roi) || 0,
            winRate: Number(t.win_rate) || Number(t.winRate) || 0,
            aum: Number(t.base_equity) || Number(t.aum) || 0,
            followers: Number(t.followers_count) || Number(t.followers) || Number(t.max_followers) || 0,
            riskScore: Number(t.risk_score) || Number(t.riskScore) || 5,
            profitShare: (Number(t.profit_share) * 100) || Number(t.profitShare) || 10,
            strategy: t.strategy || 'Mixed Strategy',
            badges: t.verified || (t.badges && t.badges.includes('Verified')) ? ['Verified', 'Top Trader'] : [],
            reviews: t.reviews || [] 
          };
          
          // 🔥 FIX: Double-cast to bypass strict structural overlap errors from the old interface
          return traderObj as unknown as LeadTrader;
        });

        setTraders(mappedTraders);
      } else {
        setTraders([]);
      }

      if (isLoggedIn) {
        const subRes = await copyTradingApi.getMySubscriptions();
        if (subRes.success && subRes.data) {
          const mappedSubs: Record<string, FollowSetting> = {};
          subRes.data.forEach((sub: any) => {
            if (sub.status === 'ACTIVE' || sub.status === 'active') {
              const tId = sub.trader_id.toString(); 
              mappedSubs[tId] = {
                traderId: tId,
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
      console.warn('Database timeout or fetch error. Please ensure backend is running.');
      setTraders([]); 
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCopyData();
  }, [fetchCopyData]);

  const createLeadTrader = async (traderData: Partial<LeadTrader>) => {
    try {
      const res = await copyTradingApi.createAdminTrader(traderData);
      if (res.success) {
        await fetchCopyData(); 
        return { success: true, message: 'Lead trader created successfully.' };
      }
      return { success: false, message: res.message || 'Failed to create lead trader.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while creating the trader.' };
    }
  };

  const editLeadTrader = async (traderId: string, traderData: Partial<LeadTrader>) => {
    try {
      const cleanId = traderId.replace(/\D/g, '');
      const res = await copyTradingApi.updateAdminTrader(cleanId, traderData);
      if (res.success) {
        await fetchCopyData(); 
        return { success: true, message: 'Lead trader updated successfully.' };
      }
      return { success: false, message: res.message || 'Failed to update lead trader.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while updating the trader.' };
    }
  };

  const deleteLeadTrader = async (traderId: string) => {
    try {
      const cleanId = traderId.replace(/\D/g, '');
      const res = await copyTradingApi.deleteAdminTrader(cleanId);
      
      if (res.success) {
        await fetchCopyData();
        return { success: true, message: 'Trader deleted successfully.' };
      }
      return { success: false, message: res.message || 'Failed to delete trader.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while deleting the trader.' };
    }
  };

  const followTrader = async (traderId: string, allocation: number, stopLoss = 15) => {
    try {
      const cleanId = traderId.replace(/\D/g, '') || traderId;
      const res = await copyTradingApi.startCopying({
        master_trader_id: cleanId,
        allocation_amount: allocation,
        leverage_mode: 'PROPORTIONAL',
        stop_loss_pct: stopLoss
      });

      if (res.success) {
        await fetchCopyData();
        await fetchLiveWallets(); 
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
      return { success: true, message: 'Stopped copying trader' };
    }

    try {
      const res = await copyTradingApi.stopCopying(sub.subscriptionId);
      if (res.success) {
        await fetchCopyData();
        await fetchLiveWallets();
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
        pendingReviews,
        createLeadTrader,
        editLeadTrader,
        deleteLeadTrader, 
        refreshTraders: fetchCopyData 
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