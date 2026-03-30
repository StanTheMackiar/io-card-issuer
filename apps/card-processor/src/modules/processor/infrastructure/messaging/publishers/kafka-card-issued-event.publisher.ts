import {
  KAFKA_TOPICS,
  nextCloudEventId,
  type CardIssuedEvent,
  type CardIssuedEventData,
} from '@app/shared';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Partitioners, type Producer } from 'kafkajs';
import { CardIssuedEventPublisherPort } from '../../../application/ports/card-issued-event-publisher.port';

@Injectable()
export class KafkaCardIssuedEventPublisher
  implements CardIssuedEventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaCardIssuedEventPublisher.name);
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
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publishIssued(event: CardIssuedEventData): Promise<void> {
    const payload: CardIssuedEvent = {
      id: nextCloudEventId(),
      source: event.requestId,
      type: KAFKA_TOPICS.CARD_ISSUED_V1,
      time: new Date().toISOString(),
      data: event,
    };

    this.logger.log(
      `Publishing CardIssuedEvent for requestId=${event.requestId} and cardId=${event.card.id}`,
    );

    await this.producer.send({
      topic: KAFKA_TOPICS.CARD_ISSUED_V1,
      messages: [
        {
          key: event.requestId,
          value: JSON.stringify(payload),
        },
      ],
    });

    this.logger.log(
      `Published CardIssuedEvent for requestId=${event.requestId}`,
    );
  }
}
