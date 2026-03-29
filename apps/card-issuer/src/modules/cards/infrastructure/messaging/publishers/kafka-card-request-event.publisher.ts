import {
  KAFKA_EVENT_IDS,
  KAFKA_TOPICS,
  type CardRequestedEvent,
  type CardRequestedEventData,
} from '@app/shared';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, type Producer } from 'kafkajs';
import { CardRequestEventPublisherPort } from '../../../application/ports/card-request-event-publisher.port';

@Injectable()
export class KafkaCardRequestEventPublisher
  implements CardRequestEventPublisherPort, OnModuleInit, OnModuleDestroy
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

  async publishRequested(event: CardRequestedEventData): Promise<void> {
    const payload: CardRequestedEvent = {
      id: KAFKA_EVENT_IDS.CARD_REQUESTED,
      source: event.requestId,
      type: KAFKA_TOPICS.CARD_REQUESTED_V1,
      time: new Date().toISOString(),
      data: event,
    };

    await this.producer.send({
      topic: KAFKA_TOPICS.CARD_REQUESTED_V1,
      messages: [
        {
          key: event.requestId,
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
