import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'user' | 'admin';
  avatar_url?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}

export const authApi = {
  login: async (credentials: Record<string, string>) => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: Record<string, string>) => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return apiClient<AuthResponse>('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (nickname: string) => {
    return apiClient<AuthResponse>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ nickname }),
    });
  },

  uploadAvatar: async (avatarDataUri: string) => {
    return apiClient<AuthResponse>('/auth/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatar: avatarDataUri }),
    });
  },

  getLoginHistory: async () => {
    return apiClient<{ success: boolean; data?: LoginHistoryRow[]; error?: string }>('/auth/login-history', {
      method: 'GET',
    });
  }
};

export interface LoginHistoryRow {
  id: number;
  ip_address: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  status: 'Success' | 'Failed';
  created_at: string;
}