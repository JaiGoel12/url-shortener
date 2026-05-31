import { Request, Response, NextFunction } from 'express';
import UAParser from 'ua-parser-js';
import { UrlService } from '../services/url.service';
import { KafkaProducerService } from '../services/kafka.producer';
import { AppError } from '../middleware/errorHandler';

export async function redirectToOriginal(req: Request, res: Response, next: NextFunction) {
  try {
    const { shortCode } = req.params;
    const urlData = await UrlService.getUrlByShortCode(shortCode);

    if (!urlData) {
      throw new AppError('Short URL not found', 404);
    }

    if (!urlData.isActive) {
      throw new AppError('This link has been deactivated', 410);
    }

    if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
      throw new AppError('This link has expired', 410);
    }

    res.redirect(301, urlData.originalUrl);

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    setImmediate(async () => {
      try {
        await UrlService.incrementClickCount(urlData.urlId);

        await KafkaProducerService.publishClickEvent({
          urlId: urlData.urlId,
          shortCode,
          ip,
          userAgent,
          referrer,
          clickedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Redirect] Async processing error:', err);
      }
    });
  } catch (err) {
    next(err);
  }
}
