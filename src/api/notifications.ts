import { apiClient } from './client';

export interface NotificationRow {
  id: number;
  title: string;
  message: string;
  category: 'alert' | 'execution' | 'copy' | 'system' | 'promotion';
  link_tab: string | null;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  getNotifications: async () => {
    return apiClient<{ success: boolean; data: NotificationRow[] }>('/notifications', { method: 'GET' });
  },
  markRead: async (id: number) => {
    return apiClient<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  markAllRead: async () => {
    return apiClient<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' });
  }
};
