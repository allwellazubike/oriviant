import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  getOrders,
  quoteOrder,
} from '../controllers/tradingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/quote', quoteOrder);
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.delete('/orders/:id', deleteOrder);

export default router;
