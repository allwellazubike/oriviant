import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NotificationItem, NavigationTab } from '../types';
import { useOverlayRegistration } from '../utils/OverlayRegistry';
import { notificationsApi, NotificationRow } from '../api/notifications';
import { socketService } from '../services/socketService';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
};

const mapRow = (row: NotificationRow): NotificationItem => ({
  id: row.id.toString(),
  title: row.title,
  message: row.message,
  timestamp: timeAgo(row.created_at),
  category: row.category,
  read: row.read,
  linkTab: (row.link_tab as NavigationTab) || undefined
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const hasFetchedRef = useRef(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  useOverlayRegistration('notification-drawer', isDrawerOpen, closeDrawer);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapRow));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  // Fetch on login, connect the private socket channel for real-time push, and
  // clear everything on logout so the next user's session starts empty.
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      hasFetchedRef.current = false;
      return;
    }

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications();
    }

    const token = localStorage.getItem('oriviant_token') || sessionStorage.getItem('oriviant_token');
    if (token && token !== 'undefined' && token !== 'null') {
      socketService.connect();
      socketService.authenticate(token);
    }

    const handlePush = (row: NotificationRow) => {
      setNotifications((prev) => [mapRow(row), ...prev]);
    };

    socketService.onNotification(handlePush);
    return () => socketService.offNotification(handlePush);
  }, [isLoggedIn, fetchNotifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const numericId = Number(id);
    if (Number.isFinite(numericId)) {
      notificationsApi.markRead(numericId).catch((err) => console.error('Failed to mark notification read:', err));
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch((err) => console.error('Failed to mark all notifications read:', err));
  };

  /** Local-only notification, for UI events that have no backend counterpart. */
  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `local-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        markAsRead,
        markAllAsRead,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
