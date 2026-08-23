import { apiClient } from './client';

export const adminApi = {
  // --- DASHBOARD & USERS ---
  getDashboardStats: async () => {
    return apiClient<{ success: boolean; data?: any; stats?: any }>('/admin/stats', { method: 'GET' });
  },
  getUsers: async () => {
    return apiClient<{ success: boolean; users: any[] }>('/admin/users', { method: 'GET' });
  },
  updateUserStatus: async (userId: string, status: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
  },
  updateKycLevel: async (userId: string, kycLevel: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/kyc`, {
      method: 'PATCH', body: JSON.stringify({ kycLevel }),
    });
  },
  updateUserBalance: async (userId: string, realBalance: number, demoBalance: number) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/balance`, {
      method: 'PATCH', body: JSON.stringify({ realBalance, demoBalance }),
    });
  },
  resetUserPassword: async (userId: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/reset-password`, { method: 'POST' });
  },
  deleteUser: async (userId: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  // --- DEPOSITS ---
  getDeposits: async (status: string = 'ALL') => {
    return apiClient<{ success: boolean; data: any[] }>(`/admin/deposits?status=${status}`, { method: 'GET' });
  },
  approveDeposit: async (id: string | number, amountToCredit?: number) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/deposits/${id}/approve`, {
      method: 'POST', 
      body: JSON.stringify({ 
        amount_received: amountToCredit, 
        amount: amountToCredit 
      }),
    });
  },
  denyDeposit: async (id: string | number) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/deposits/${id}/reject`, { method: 'POST' });
  },

  // --- WITHDRAWALS ---
  getWithdrawals: async (status: string = 'ALL') => {
    return apiClient<{ success: boolean; data: any[] }>(`/admin/withdrawals?status=${status}`, { method: 'GET' });
  },
  approveWithdrawal: async (id: string | number, txHash?: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/withdrawals/${id}/approve`, {
      method: 'POST', 
      body: JSON.stringify({ 
        tx_hash: txHash, 
        txHash: txHash 
      }),
    });
  },
  denyWithdrawal: async (id: string | number, reason?: string) => {
    return apiClient<{ success: boolean; message: string }>(`/admin/withdrawals/${id}/reject`, {
      method: 'POST', body: JSON.stringify({ reason }),
    });
  },

  // --- SYSTEM TELEMETRY ---
  getSystemTelemetry: async () => {
    return apiClient<{ success: boolean; telemetry: any }>('/admin/telemetry', { method: 'GET' });
  },

  // --- ANALYTICS & TRAFFIC ---
  getAnalytics: async () => {
    return apiClient<{ success: boolean; data: any }>('/admin/analytics', { method: 'GET' });
  },

  // --- BROADCAST BANNERS ---
  getBroadcasts: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/admin/broadcasts', { method: 'GET' });
  },
  sendBroadcast: async (payload: { title: string; message: string; severity: string; audience: string }) => {
    return apiClient<{ success: boolean; message: string; data: any }>('/admin/broadcasts', {
      method: 'POST', body: JSON.stringify(payload),
    });
  },

  // --- LEADER TRADERS DESK ---
  getCopyTraders: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/admin/copy-traders', { method: 'GET' });
  },
  updateCopyTraderStatus: async (id: string | number, status: string) => {
    return apiClient<{ success: boolean; message: string; data: any }>(`/admin/copy-traders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
  }
};