import { Router } from 'express';
import {
  getPendingDeposits,
  approveDeposit,
  denyDeposit,
  getUsers,
  getAdminStats,
} from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Every admin route requires a valid token AND the admin role.
router.use(verifyToken, verifyAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/deny', denyDeposit);

export default router;
