import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import urlRoutes from './routes/url.routes';
import analyticsRoutes from './routes/analytics.routes';
import { redirectToOriginal } from './controllers/redirect.controller';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { startExpiryJob } from './jobs/expiry.job';
import { getKafkaProducer, disconnectKafka } from './config/kafka';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(globalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'url-service', timestamp: new Date().toISOString() });
});

app.get('/:shortCode', redirectToOriginal);

app.use(errorHandler);

async function bootstrap() {
  try {
    await getKafkaProducer();
    console.log('[Server] Kafka producer ready');
  } catch (err) {
    console.warn('[Server] Kafka unavailable, click events will not be published:', (err as Error).message);
  }

  startExpiryJob();

  app.listen(PORT, () => {
    console.log(`[Server] URL Service running on http://localhost:${PORT}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('[Server] Shutting down...');
  await disconnectKafka();
  process.exit(0);
});

bootstrap();
