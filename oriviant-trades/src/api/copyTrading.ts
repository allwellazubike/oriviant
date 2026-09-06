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
    return apiClient<{ success: boolean; data: any[] }>('/copy/traders', {
      method: 'GET',
    });
  },

  startCopying: async (settings: CopyTradeSettings) => {
    return apiClient<{ success: boolean; message: string; subscription?: any }>('/copy/subscriptions', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  stopCopying: async (subscriptionId: number | string) => {
    return apiClient<{ success: boolean; message: string }>(`/copy/subscriptions/${subscriptionId}`, {
      method: 'DELETE', 
    });
  },

  getMySubscriptions: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/copy/subscriptions', {
      method: 'GET',
    });
  },

  createAdminTrader: async (traderData: any) => {
    return apiClient<{ success: boolean; message: string; data?: any }>('/copy/admin/traders', {
      method: 'POST',
      body: JSON.stringify(traderData),
    });
  },

  updateAdminTrader: async (traderId: string | number, traderData: any) => {
    return apiClient<{ success: boolean; message: string; data?: any }>(`/copy/admin/traders/${traderId}`, {
      method: 'PUT',
      body: JSON.stringify(traderData),
    });
  },

  deleteAdminTrader: async (traderId: string | number) => {
    return apiClient<{ success: boolean; message: string }>(`/copy/admin/traders/${traderId}`, {
      method: 'DELETE',
    });
  },

  // 🔥 Added to fetch all subscriptions
  getAllSubscriptions: async () => {
    return apiClient<{ success: boolean; data?: any[] }>('/copy/admin/subscriptions', {
      method: 'GET',
    });
  },

  // 🔥 Added to boost subscriptions
  updateSubscriptionAdmin: async (subId: number, data: any) => {
    return apiClient<{ success: boolean; message: string; data?: any }>(`/copy/admin/subscriptions/${subId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};