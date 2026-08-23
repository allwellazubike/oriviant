import express from 'express';
import { getAcademyProgress, updateAcademyProgress } from '../controllers/academyController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Require login for all academy routes
router.use(verifyToken); 

router.get('/progress', getAcademyProgress);
router.post('/progress', updateAcademyProgress);

export default router;