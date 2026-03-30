import { KAFKA_TOPICS, type CardIssuedEvent } from '@app/shared';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';

@Injectable()
export class CardIssuedConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CardIssuedConsumer.name);
  private readonly consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
    });

    this.consumer = kafka.consumer({
      groupId: `${this.configService.getOrThrow<string>('kafka.processorGroupId')}-issued`,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.CARD_ISSUED_V1,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const event = JSON.parse(message.value.toString()) as CardIssuedEvent;

        this.logger.log(
          `Received card issued event for requestId=${event.data.requestId}. CardId=${event.data.card.id}. LastFour=${event.data.card.lastFour}`,
        );

        await Promise.resolve();
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }
}
