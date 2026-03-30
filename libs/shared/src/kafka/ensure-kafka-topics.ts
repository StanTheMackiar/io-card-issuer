import { Kafka } from 'kafkajs';

type EnsureKafkaTopicsOptions = {
  clientId: string;
  brokers: string[];
  topics: string[];
};

export async function ensureKafkaTopics(
  options: EnsureKafkaTopicsOptions,
): Promise<void> {
  const kafka = new Kafka({
    clientId: options.clientId,
    brokers: options.brokers,
  });
  const admin = kafka.admin();

  await admin.connect();

  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: options.topics.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
  } finally {
    await admin.disconnect();
  }
}
