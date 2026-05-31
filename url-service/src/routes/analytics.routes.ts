import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUrlAnalytics, getClicksByTimeRange, getTopCountries } from '../controllers/analytics.controller';

const router = Router();

router.get('/:urlId', authenticate, getUrlAnalytics);
router.get('/:urlId/clicks', authenticate, getClicksByTimeRange);
router.get('/:urlId/geo', authenticate, getTopCountries);

export default router;
