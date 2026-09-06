import { Router } from 'express';
import { handleTransfer } from '../controllers/transferController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Require authentication for all transfer actions
router.use(verifyToken);

// Route requests to our bulletproof transfer controller
router.post('/', handleTransfer);
router.post('/internal', handleTransfer);

export default router;