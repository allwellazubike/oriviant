import { Router } from 'express';
import { withdrawalController } from '../controllers/withdrawalController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, withdrawalController.requestWithdrawal);
router.get('/', verifyToken, withdrawalController.getWithdrawals);

export default router;