import {
  ensureKafkaTopics,
  KAFKA_TOPICS,
  nextCloudEventId,
  type CardRequestedEvent,
  type CardRequestedEventData,
} from '@app/shared';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Partitioners, type Producer } from 'kafkajs';
import { CardRequestEventPublisherPort } from '../../../application/ports/card-request-event-publisher.port';

@Injectable()
export class KafkaCardRequestEventPublisher
  implements CardRequestEventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(KafkaCardRequestEventPublisher.name);
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
    });

    this.producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async onModuleInit(): Promise<void> {
    await ensureKafkaTopics({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
      topics: [KAFKA_TOPICS.CARD_REQUESTED_V1],
    });
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publishRequested(event: CardRequestedEventData): Promise<void> {
    const payload: CardRequestedEvent = {
      id: nextCloudEventId(),
      source: event.requestId,
      type: KAFKA_TOPICS.CARD_REQUESTED_V1,
      time: new Date().toISOString(),
      data: event,
    };

    this.logger.log(
      `Publishing CardRequestedEvent for requestId: ${event.requestId}`,
    );

    await this.producer.send({
      topic: KAFKA_TOPICS.CARD_REQUESTED_V1,
      messages: [
        {
          key: event.requestId,
          value: JSON.stringify(payload),
        },
      ],
    });

    this.logger.log(
      `Published CardRequestedEvent for requestId: ${event.requestId}`,
    );
  }
}
