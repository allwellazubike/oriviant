import { Router } from 'express';
import {
  getTraders,
  getTrader,
  postFollow,
  deleteFollow,
  getSubscriptions,
  getPositions,
} from '../controllers/copyTradingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Browsing leaders needs a session but not a funded account — the leaderboard
// is part of deciding whether to fund one.
router.get('/traders', verifyToken, getTraders);
router.get('/traders/:id', verifyToken, getTrader);

router.get('/subscriptions', verifyToken, getSubscriptions);
router.post('/subscriptions', verifyToken, postFollow);
router.delete('/subscriptions/:id', verifyToken, deleteFollow);

router.get('/positions', verifyToken, getPositions);

export default router;
