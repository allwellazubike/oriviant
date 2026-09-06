import { Router } from 'express';
import {
  register,
  verifyRegistrationCode,
  login,
  logout,
  me,
  updateProfile,
  updateAvatar,
  getLoginHistory,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getReferralStats,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/verify-registration', verifyRegistrationCode);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);
router.patch('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, updateAvatar);
router.get('/login-history', verifyToken, getLoginHistory);

router.get('/referrals', verifyToken, getReferralStats);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;
