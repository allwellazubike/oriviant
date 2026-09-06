import { Router } from 'express';
import { getMyAccount, postTrade, postResetMine } from '../controllers/practiceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/account', verifyToken, getMyAccount);
router.post('/trade', verifyToken, postTrade);
router.post('/reset', verifyToken, postResetMine);

export default router;
