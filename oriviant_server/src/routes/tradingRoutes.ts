import { Router } from 'express';
import { createOrder, getOrders, deleteOrder, getTradeHistory, quoteOrder } from '../controllers/tradingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Protect all trading routes with authentication
router.use(verifyToken);

// Match frontend tradingApi.ts paths precisely
router.post('/order', createOrder);
router.post('/', createOrder);

router.get('/orders', getOrders);
router.get('/history', getTradeHistory);

router.post('/orders/:id/cancel', deleteOrder);
router.delete('/orders/:id', deleteOrder);
router.delete('/:id', deleteOrder);

router.get('/quote', quoteOrder);

export default router;