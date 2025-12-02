import { Router } from 'express';
import { getPrices, getTokens, simulateSwap, getChartData } from '../controllers/swapController';

const router = Router();

router.get('/tokens', getTokens);
router.get('/price', getPrices);
router.get('/chart', getChartData);
router.post('/swap/simulate', simulateSwap);

export default router;