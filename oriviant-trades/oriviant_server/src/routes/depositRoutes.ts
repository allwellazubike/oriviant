import { Router } from 'express';
import {
  createDepositRequest,
  getUserDeposits,
  getDepositOptions,
} from '../controllers/depositController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/options', verifyToken, getDepositOptions);
router.post('/', verifyToken, createDepositRequest);
router.get('/', verifyToken, getUserDeposits);

export default router;
