import { apiClient } from './client';

export const practiceApi = {
  getAccount: async () => {
    return apiClient<{ success: boolean; data: any }>('/practice/account', { method: 'GET' });
  },
  recordTrade: async (payload: { pair?: string; side?: string; description?: string; pnl: number }) => {
    return apiClient<{ success: boolean; data: any }>('/practice/trade', {
      method: 'POST', body: JSON.stringify(payload),
    });
  },
  resetMine: async () => {
    return apiClient<{ success: boolean; data: any }>('/practice/reset', { method: 'POST' });
  }
};
