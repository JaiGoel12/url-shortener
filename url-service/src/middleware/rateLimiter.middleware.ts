import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { AppError } from './errorHandler';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyPrefix } = config;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        return next(
          new AppError(
            `Rate limit exceeded. Try again in ${ttl} seconds.`,
            429
          )
        );
      }

      next();
    } catch (err) {
      console.error('[RateLimiter] Redis error, allowing request:', err);
      next();
    }
  };
}

export const globalRateLimiter = rateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyPrefix: 'ratelimit:global',
});

export const createUrlRateLimiter = rateLimiter({
  windowMs: 3600000,
  maxRequests: 50,
  keyPrefix: 'ratelimit:create',
});
