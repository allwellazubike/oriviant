import { apiClient } from './client';

export const securityApi = {
  getSecurityState: async () => {
    return apiClient<{ success: boolean; data: any }>('/user/security', {
      method: 'GET',
    });
  },

  updateAntiPhishingCode: async (code: string) => {
    return apiClient<{ success: boolean; message: string }>('/user/security/anti-phishing', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  getSessions: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/user/sessions', {
      method: 'GET',
    });
  },

  revokeSession: async (sessionId: string | number) => {
    return apiClient<{ success: boolean; message: string }>(`/user/sessions/${sessionId}/revoke`, {
      method: 'POST',
    });
  },

  getAuditLogs: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/user/audit-logs', {
      method: 'GET',
    });
  }
};