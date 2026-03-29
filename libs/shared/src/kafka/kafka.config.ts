export type KafkaConfig = {
  brokers: string[];
  clientId: string;
  processorGroupId: string;
};

export function getKafkaConfigFromEnv(): KafkaConfig {
  return {
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean),
    clientId: process.env.KAFKA_CLIENT_ID ?? 'io-card-platform',
    processorGroupId:
      process.env.KAFKA_PROCESSOR_GROUP_ID ?? 'card-processor-group',
  };
}
