import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
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
  }
};