import { ensureKafkaTopics, KAFKA_TOPICS } from '@app/shared';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaTopicsBootstrap implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await ensureKafkaTopics({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
      topics: [
        KAFKA_TOPICS.CARD_REQUESTED_V1,
        KAFKA_TOPICS.CARD_REQUESTED_V1_DLQ,
        KAFKA_TOPICS.CARD_ISSUED_V1,
      ],
    });
  }
}
