import { apiClient } from './client';

export interface CopyTradeSettings {
  master_trader_id: number | string;
  allocation_amount: number;
  leverage_mode: 'PROPORTIONAL' | 'FIXED';
  fixed_leverage?: number;
  stop_loss_pct?: number;
  take_profit_pct?: number;
}

export const copyTradingApi = {
  getLeaderboard: async () => {
    // FIX: Updated to match the backend route /api/copy/traders
    return apiClient<{ success: boolean; data: any[] }>('/copy/traders', {
      method: 'GET',
    });
  },

  startCopying: async (settings: CopyTradeSettings) => {
    // FIX: Updated to match backend route /api/copy/subscriptions
    return apiClient<{ success: boolean; message: string; subscription?: any }>('/copy/subscriptions', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  stopCopying: async (subscriptionId: number | string) => {
    // FIX: Updated to DELETE method and correct route
    return apiClient<{ success: boolean; message: string }>(`/copy/subscriptions/${subscriptionId}`, {
      method: 'DELETE', 
    });
  },

  getMySubscriptions: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/copy/subscriptions', {
      method: 'GET',
    });
  }
};