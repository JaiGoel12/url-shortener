import dotenv from 'dotenv';
dotenv.config();

import { connectCassandra } from './config/cassandra';
import { startClickConsumer, stopClickConsumer } from './consumers/click.consumer';
import { startGrpcServer } from './grpc/analytics.server';

async function bootstrap() {
  console.log('[Analytics Service] Starting...');

  try {
    await connectCassandra();
  } catch (err) {
    console.error('[Analytics Service] Failed to connect to Cassandra:', err);
    process.exit(1);
  }

  startGrpcServer();

  try {
    await startClickConsumer();
  } catch (err) {
    console.error('[Analytics Service] Failed to start Kafka consumer:', err);
    console.warn('[Analytics Service] Running without Kafka consumer');
  }

  console.log('[Analytics Service] Ready');
}

process.on('SIGTERM', async () => {
  console.log('[Analytics Service] Shutting down...');
  await stopClickConsumer();
  process.exit(0);
});

bootstrap();
