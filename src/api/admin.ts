import { apiClient } from './client';
import { DepositRecord, WithdrawalRecord } from '../types/wallet';

export const adminApi = {
  // -------------------------
  // Dashboard & Users
  // -------------------------
  getStats: async () => {
    return apiClient<{ success: boolean; data: any }>('/admin/stats', {
      method: 'GET',
    });
  },

  getUsers: async (search: string = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient<{ success: boolean; count: number; data: any[] }>(`/admin/users${query}`, {
      method: 'GET',
    });
  },

  // -------------------------
  // Deposits
  // -------------------------
  getDeposits: async (status: string = 'PENDING') => {
    return apiClient<{ success: boolean; data: any[] }>(`/admin/deposits?status=${status}`, {
      method: 'GET',
    });
  },

  approveDeposit: async (id: number | string, amountReceived: number) => {
    return apiClient<{ success: boolean; message: string; data: any }>(`/admin/deposits/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ amount_received: amountReceived }),
    });
  },

  denyDeposit: async (id: number | string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/deposits/${id}/deny`, {
      method: 'POST',
    });
  },

  // -------------------------
  // Withdrawals
  // -------------------------
  getWithdrawals: async (status: string = 'PENDING') => {
    return apiClient<{ success: boolean; data: any[] }>(`/admin/withdrawals?status=${status}`, {
      method: 'GET',
    });
  },

  approveWithdrawal: async (id: number | string, txHash?: string) => {
    return apiClient<{ success: boolean; message: string; data: any }>(`/admin/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ tx_hash: txHash }),
    });
  },

  denyWithdrawal: async (id: number | string, reason?: string) => {
    return apiClient<{ success: boolean; message: string; data: any }>(`/admin/withdrawals/${id}/deny`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};