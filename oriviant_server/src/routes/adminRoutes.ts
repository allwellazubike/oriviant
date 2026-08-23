import { Router } from 'express';
import {
  getPendingDeposits,
  approveDeposit,
  denyDeposit,
  getPendingWithdrawals,
  getUsers,
  getAdminStats,
  updateUser,
  getAuditLogs,
  getLedgerLogs,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { withdrawalController } from '../controllers/withdrawalController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Every admin route requires a valid token AND the admin role.
router.use(verifyToken, verifyAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/deny', denyDeposit);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/approve', withdrawalController.approveWithdrawal);
router.post('/withdrawals/:id/deny', withdrawalController.denyWithdrawal);

// Audit & System Logs
router.get('/audit-logs', getAuditLogs);
router.get('/ledger-logs', getLedgerLogs);

// System Settings & Governance
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

export default router;
