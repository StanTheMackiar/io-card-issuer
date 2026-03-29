import {
  KAFKA_EVENT_IDS,
  KAFKA_TOPICS,
  type CardRequestedDlqEvent,
  type CardRequestedDlqEventData,
} from '@app/shared';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Producer } from 'kafkajs';
import { CardRequestedDlqEventPublisherPort } from '../../../application/ports/card-requested-dlq-event-publisher.port';

@Injectable()
export class KafkaCardRequestedDlqEventPublisher
  implements CardRequestedDlqEventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: this.configService.getOrThrow<string>('kafka.clientId'),
      brokers: this.configService.getOrThrow<string[]>('kafka.brokers'),
    });

    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  async publishDlq(event: CardRequestedDlqEventData): Promise<void> {
    const payload: CardRequestedDlqEvent = {
      id: KAFKA_EVENT_IDS.CARD_REQUESTED_DLQ,
      source: event.payload.requestId,
      type: KAFKA_TOPICS.CARD_REQUESTED_V1_DLQ,
      time: new Date().toISOString(),
      data: event,
    };

    await this.producer.send({
      topic: KAFKA_TOPICS.CARD_REQUESTED_V1_DLQ,
      messages: [
        {
          key: event.payload.requestId,
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
