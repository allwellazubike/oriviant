import { Router } from 'express';
import { getMarketPrices, getQuote } from '../controllers/marketController.js';

const router = Router();

router.get('/prices', getMarketPrices);
router.get('/quote', getQuote);

export default router;
