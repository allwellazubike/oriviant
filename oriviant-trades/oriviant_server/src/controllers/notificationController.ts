import { Request, Response } from 'express';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService.js';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = await listNotifications(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const readNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification id.' });
    }
    await markNotificationRead(userId, id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const readAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await markAllNotificationsRead(userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
