import { KAFKA_TOPICS, type CardRequestedDlqEvent } from '@app/shared';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';

@Injectable()
export class CardRequestedDlqConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CardRequestedDlqConsumer.name);
  private readonly consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
    });

    this.consumer = kafka.consumer({
      groupId: `${this.configService.getOrThrow<string>('kafka.processorGroupId')}-dlq`,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.CARD_REQUESTED_V1_DLQ,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const event = JSON.parse(
          message.value.toString(),
        ) as CardRequestedDlqEvent;

        this.logger.error(
          `Received card request DLQ event for requestId=${event.data.payload.requestId}. Reason=${event.data.reason}. Attempts=${event.data.attempts}`,
        );

        await Promise.resolve();
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }
}
