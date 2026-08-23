import { apiClient } from './client';

export const marketsApi = {
  getMarkets: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/admin/markets', { method: 'GET' });
  },
  createMarket: async (data: any) => {
    return apiClient<{ success: boolean; data: any }>('/admin/markets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateMarket: async (id: string, data: any) => {
    return apiClient<{ success: boolean; data: any }>(`/admin/markets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteMarket: async (id: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/markets/${id}`, {
      method: 'DELETE'
    });
  },
  updateMarketStatus: async (id: string, status: string) => {
    return apiClient<{ success: boolean; data: any }>(`/admin/markets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};