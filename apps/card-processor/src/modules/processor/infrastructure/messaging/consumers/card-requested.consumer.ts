import { KAFKA_TOPICS, type CardRequestedEvent } from '@app/shared';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';
import { ProcessCardRequestedEventUseCase } from '../../../application/use-cases/process-card-requested-event.use-case';

@Injectable()
export class CardRequestedConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CardRequestedConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly processCardRequestedEventUseCase: ProcessCardRequestedEventUseCase,
  ) {
    const kafka = new Kafka({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
    });

    this.consumer = kafka.consumer({
      groupId: this.configService.getOrThrow<string>('kafka.processorGroupId'),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.CARD_REQUESTED_V1,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        try {
          const event = JSON.parse(
            message.value.toString(),
          ) as CardRequestedEvent;

          await this.processCardRequestedEventUseCase.execute(event.data);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to process card requested event: ${errorMessage}`,
          );
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
  }
}
