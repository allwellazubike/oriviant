import { Router } from 'express';
import { submitLevel1 } from '../controllers/kycController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/kyc/level1
router.post('/level1', verifyToken, submitLevel1);

export default router;