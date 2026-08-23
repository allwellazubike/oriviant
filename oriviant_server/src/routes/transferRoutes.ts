import { Router } from 'express';
import { transferController } from '../controllers/transferController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, transferController.transferFunds);
router.get('/history', verifyToken, transferController.getHistory);

export default router;