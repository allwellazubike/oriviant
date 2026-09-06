import { Router } from 'express';
import {
  getTraders,
  getTrader,
  postFollow,
  deleteFollow,
  getSubscriptions,
  getPositions,
  postAdminTrader,
  putAdminTrader,    
  getAdminTraders,
  patchTraderStatus,
  deleteAdminTrader,
  getAllSubscriptionsAdmin, // 🔥 Added
  patchSubscriptionAdmin    // 🔥 Added
} from '../controllers/copyTradingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// --- PUBLIC/USER ROUTES ---
router.get('/traders', verifyToken, getTraders);
router.get('/traders/:id', verifyToken, getTrader);

router.get('/subscriptions', verifyToken, getSubscriptions);
router.post('/subscriptions', verifyToken, postFollow);
router.delete('/subscriptions/:id', verifyToken, deleteFollow);

router.get('/positions', verifyToken, getPositions);

// --- ADMIN ROUTES ---
router.post('/admin/traders', verifyToken, postAdminTrader);
router.put('/admin/traders/:id', verifyToken, putAdminTrader); 
router.get('/admin/traders', verifyToken, getAdminTraders);
router.patch('/admin/traders/:id/status', verifyToken, patchTraderStatus);
router.delete('/admin/traders/:id', verifyToken, deleteAdminTrader);

// 🔥 NEW: Admin Subscription & Copier Management Routes
router.get('/admin/subscriptions', verifyToken, getAllSubscriptionsAdmin);
router.patch('/admin/subscriptions/:id', verifyToken, patchSubscriptionAdmin);

export default router;