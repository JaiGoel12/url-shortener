import { Consumer } from 'kafkajs';
import UAParser from 'ua-parser-js';
import { createConsumer } from '../config/kafka';
import { AnalyticsService } from '../services/analytics.service';

let consumer: Consumer;

async function getGeoFromIP(ip: string) {
  try {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168')) {
      return { country: 'Local', city: 'Localhost' };
    }
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    if (!response.ok) return { country: 'Unknown', city: 'Unknown' };
    const data = await response.json();
    return { country: data.country || 'Unknown', city: data.city || 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

export async function startClickConsumer(): Promise<void> {
  consumer = createConsumer();
  await consumer.connect();
  console.log('[Kafka Consumer] Connected');

  const topic = process.env.KAFKA_TOPIC || 'click-events';
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const value = message.value?.toString();
        if (!value) return;

        const event = JSON.parse(value);
        const { urlId, ip, userAgent, referrer, clickedAt } = event;

        const parser = new UAParser(userAgent);
        const device = parser.getDevice().type || 'desktop';
        const browser = parser.getBrowser().name || 'Unknown';

        const geo = await getGeoFromIP(ip);

        await AnalyticsService.insertClick({
          urlId,
          ip,
          country: geo.country,
          city: geo.city,
          device,
          browser,
          referrer: referrer || 'Direct',
          clickedAt,
        });
      } catch (err) {
        console.error('[Kafka Consumer] Error processing message:', err);
      }
    },
  });

  console.log(`[Kafka Consumer] Listening on topic: ${topic}`);
}

export async function stopClickConsumer(): Promise<void> {
  if (consumer) {
    await consumer.disconnect();
    console.log('[Kafka Consumer] Disconnected');
  }
}
