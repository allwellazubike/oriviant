import { Router } from 'express';
import { getWallets, getLedger, transferFunds } from '../controllers/walletController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Require authentication for all wallet actions
router.use(verifyToken);

// Fetch balances and history
router.get('/', getWallets);
router.get('/ledger', getLedger);

// Execute internal transfers between Spot, Futures, and Funding
router.post('/transfer', transferFunds);

export default router;
