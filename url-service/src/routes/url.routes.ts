import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createUrlRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  createUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
} from '../controllers/url.controller';

const router = Router();

router.post('/', authenticate, createUrlRateLimiter, createUrl);
router.get('/', authenticate, getUserUrls);
router.get('/:id', authenticate, getUrlById);
router.patch('/:id', authenticate, updateUrl);
router.delete('/:id', authenticate, deleteUrl);

export default router;
