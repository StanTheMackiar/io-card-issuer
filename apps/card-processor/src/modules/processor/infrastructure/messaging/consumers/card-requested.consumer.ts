import {
  KAFKA_TOPICS,
  sleep,
  type CardRequestedDlqEventData,
  type CardRequestedEvent,
} from '@app/shared';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Consumer } from 'kafkajs';
import {
  CARD_REQUESTED_DLQ_EVENT_PUBLISHER,
  type CardRequestedDlqEventPublisherPort,
} from '../../../application/ports/card-requested-dlq-event-publisher.port';
import { ProcessCardRequestedEventUseCase } from '../../../application/use-cases/process-card-requested-event.use-case';

@Injectable()
export class CardRequestedConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CardRequestedConsumer.name);
  private static readonly retryDelaysMs = [1000, 2000, 4000] as const;
  private static readonly maxRetryAttempts =
    CardRequestedConsumer.retryDelaysMs.length;
  private readonly consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly processCardRequestedEventUseCase: ProcessCardRequestedEventUseCase,
    @Inject(CARD_REQUESTED_DLQ_EVENT_PUBLISHER)
    private readonly cardRequestedDlqEventPublisher: CardRequestedDlqEventPublisherPort,
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

        const event = JSON.parse(
          message.value.toString(),
        ) as CardRequestedEvent;

        this.logger.log(
          `Received card requested event for requestId=${event.data.requestId}`,
        );

        try {
          await this.processWithRetry(event.data);
          this.logger.log(
            `Processed card requested event successfully for requestId=${event.data.requestId}`,
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this.logger.error(
            `Exhausted retries for requestId=${event.data.requestId}. Sending event to DLQ`,
          );
          await this.publishToDlq(event.data, errorMessage);

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

  private async processWithRetry(
    event: CardRequestedEvent['data'],
  ): Promise<void> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= CardRequestedConsumer.maxRetryAttempts;
      attempt += 1
    ) {
      try {
        await this.processCardRequestedEventUseCase.execute(event);

        return;
      } catch (error: unknown) {
        lastError = error;

        if (attempt === CardRequestedConsumer.maxRetryAttempts) {
          break;
        }

        const delayMs = CardRequestedConsumer.retryDelaysMs[attempt];
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(
          `Retrying card request ${event.requestId} in ${delayMs}ms after failure: ${errorMessage}`,
        );

        await sleep(delayMs);
      }
    }

    throw lastError;
  }

  private async publishToDlq(
    event: CardRequestedEvent['data'],
    reason: string,
  ): Promise<void> {
    const dlqEvent: CardRequestedDlqEventData = {
      reason,
      attempts: CardRequestedConsumer.maxRetryAttempts,
      payload: event,
    };

    await this.cardRequestedDlqEventPublisher.publishDlq(dlqEvent);
  }
}
