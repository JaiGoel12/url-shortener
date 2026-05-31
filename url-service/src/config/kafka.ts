import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'url-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

let producer: Producer;

export async function getKafkaProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log('[Kafka] Producer connected');
  }
  return producer;
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    console.log('[Kafka] Producer disconnected');
  }
}

export default kafka;
