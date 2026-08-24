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
  getSystemTelemetry, // <-- Add this!
  getAnalyticsOverview,
  sendBroadcast,
  getBroadcasts,
  // ---> NEW USER MANAGEMENT IMPORTS <---
  updateUserStatus,
  updateUserKyc,
  updateUserBalance,
  deleteUserAccount,
  getUserLedger,
  getUserReferrals
} from '../controllers/adminController.js';
import { withdrawalController } from '../controllers/withdrawalController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

// ---> FIX: Import the new market controllers! <---
import {
  getAdminMarkets,
  createMarket,
  updateMarket,
  deleteMarket,
  quickUpdateMarketStatus
} from '../controllers/marketController.js';
import { getAdminTraders, patchTraderStatus } from '../controllers/copyTradingController.js';
import { getAcademyOverview, setLessonStatus } from '../controllers/academyController.js';
import { getReportCounts, exportReport } from '../controllers/reportsController.js';
import { getAdminAccounts, getAdminLeaderboard, postAdminResetOne, postAdminResetAll } from '../controllers/practiceController.js';

const router = Router();

// Every admin route requires a valid token AND the admin role.
router.use(verifyToken, verifyAdmin);

router.get('/stats', getAdminStats);

// --- USER MANAGEMENT ROUTES ---
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/kyc', updateUserKyc);
router.patch('/users/:id/balance', updateUserBalance);
router.delete('/users/:id', deleteUserAccount);
router.get('/users/:id/ledger', getUserLedger);
router.get('/users/:id/referrals', getUserReferrals);
// We keep the generic update for roles/vip
router.patch('/users/:id', updateUser);

// --- FINANCIALS ---
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/deny', denyDeposit);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/approve', withdrawalController.approveWithdrawal);
router.post('/withdrawals/:id/deny', withdrawalController.denyWithdrawal);

// ---> FIX: Add the Market Management Routes! <---
router.get('/markets', getAdminMarkets);
router.post('/markets', createMarket);
router.put('/markets/:id', updateMarket);
router.patch('/markets/:id/status', quickUpdateMarketStatus);
router.delete('/markets/:id', deleteMarket);

// Leader Traders Desk — every trader regardless of status, plus approve/
// suspend/reject actions (repurposes copy_traders.status; no separate
// "application" table exists yet).
router.get('/copy-traders', getAdminTraders);
router.patch('/copy-traders/:id/status', patchTraderStatus);

// Academy & Content
router.get('/academy/overview', getAcademyOverview);
router.patch('/academy/lessons/:lessonId/status', setLessonStatus);

// Reports & Export
router.get('/reports/counts', getReportCounts);
router.get('/reports/export', exportReport);

// Practice Mode Desk
router.get('/practice/accounts', getAdminAccounts);
router.get('/practice/leaderboard', getAdminLeaderboard);
router.post('/practice/:userId/reset', postAdminResetOne);
router.post('/practice/reset-all', postAdminResetAll);

// Audit & System Logs
router.get('/audit-logs', getAuditLogs);
router.get('/ledger-logs', getLedgerLogs);

// System Settings & Governance
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.get('/telemetry', getSystemTelemetry);
router.get('/analytics', getAnalyticsOverview);

// Broadcast Banners
router.get('/broadcasts', getBroadcasts);
router.post('/broadcasts', sendBroadcast);

export default router;
