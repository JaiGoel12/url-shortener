import { Kafka, Consumer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export function createConsumer(): Consumer {
  return kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || 'analytics-consumer-group',
  });
}

export default kafka;
