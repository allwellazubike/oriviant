import { Router } from 'express';
import { submitLevel1, submitLevel2, getMyKycStatus } from '../controllers/kycController.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();

// Configure multer to hold files in memory temporarily before sending to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/kyc/my-status (Fetch independent Level 1 & Level 2 statuses)
router.get('/my-status', verifyToken, getMyKycStatus);

// POST /api/kyc/level1 (JSON data)
router.post('/level1', verifyToken, submitLevel1);

// POST /api/kyc/level2 (Multipart Form Data with Images)
router.post('/level2', verifyToken, upload.fields([
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitLevel2);

export default router;