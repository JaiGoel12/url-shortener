import { getKafkaProducer } from '../config/kafka';

export interface ClickEvent {
  urlId: string;
  shortCode: string;
  ip: string;
  userAgent: string;
  referrer: string;
  clickedAt: string;
}

export class KafkaProducerService {
  static async publishClickEvent(event: ClickEvent): Promise<void> {
    try {
      const producer = await getKafkaProducer();
      const topic = process.env.KAFKA_TOPIC || 'click-events';

      await producer.send({
        topic,
        messages: [
          {
            key: event.urlId,
            value: JSON.stringify(event),
            timestamp: new Date(event.clickedAt).getTime().toString(),
          },
        ],
      });
    } catch (err) {
      console.error('[Kafka] Failed to publish click event:', err);
    }
  }
}
