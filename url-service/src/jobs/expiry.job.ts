import cron from 'node-cron';
import prisma from '../config/db';
import redis from '../config/redis';

export function startExpiryJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running expired URL cleanup...');

    try {
      const expiredUrls = await prisma.url.findMany({
        where: {
          isActive: true,
          expiresAt: { lte: new Date() },
        },
        select: { id: true, shortCode: true },
      });

      if (expiredUrls.length === 0) {
        console.log('[Cron] No expired URLs found.');
        return;
      }

      await prisma.url.updateMany({
        where: {
          id: { in: expiredUrls.map((u) => u.id) },
        },
        data: { isActive: false },
      });

      const pipeline = redis.pipeline();
      expiredUrls.forEach((url) => {
        pipeline.del(`cache:url:${url.shortCode}`);
      });
      await pipeline.exec();

      console.log(`[Cron] Deactivated ${expiredUrls.length} expired URLs.`);
    } catch (err) {
      console.error('[Cron] Expiry job error:', err);
    }
  });

  console.log('[Cron] Expiry cleanup job scheduled (hourly).');
}
