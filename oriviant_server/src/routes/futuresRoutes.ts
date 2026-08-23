import { Router } from 'express';
import { futuresController } from '../controllers/futuresController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/position', verifyToken, futuresController.openPosition);
router.get('/positions', verifyToken, futuresController.getPositions);
router.post('/positions/:id/close', verifyToken, futuresController.closePosition);
router.post('/leverage', verifyToken, futuresController.updateLeverage);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 96e8d059d1f94e6fa080419cd20cce8e46294503
