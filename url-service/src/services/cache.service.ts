import redis from '../config/redis';

interface CachedUrl {
  originalUrl: string;
  isActive: boolean;
  expiresAt: string | null;
  urlId: string;
}

const CACHE_TTL = 3600; // 1 hour
const KEY_PREFIX = 'cache:url:';

export class CacheService {
  static async getUrl(shortCode: string): Promise<CachedUrl | null> {
    const data = await redis.get(`${KEY_PREFIX}${shortCode}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async setUrl(shortCode: string, urlData: CachedUrl): Promise<void> {
    await redis.set(
      `${KEY_PREFIX}${shortCode}`,
      JSON.stringify(urlData),
      'EX',
      CACHE_TTL
    );
  }

  static async invalidateUrl(shortCode: string): Promise<void> {
    await redis.del(`${KEY_PREFIX}${shortCode}`);
  }
}
