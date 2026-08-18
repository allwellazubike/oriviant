import { Router } from 'express';
import { getWallets, getLedger } from '../controllers/walletController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/', getWallets);
router.get('/ledger', getLedger);

export default router;
