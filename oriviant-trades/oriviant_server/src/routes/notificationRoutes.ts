import { Router } from 'express';
import { getNotifications, readNotification, readAllNotifications } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getNotifications);
router.patch('/read-all', verifyToken, readAllNotifications);
router.patch('/:id/read', verifyToken, readNotification);

export default router;
