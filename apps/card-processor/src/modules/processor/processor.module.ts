import { CardOrmEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_ISSUED_EVENT_PUBLISHER } from './application/ports/card-issued-event-publisher.port';
import { CARD_PROCESSOR_REPOSITORY } from './application/ports/card-processor.repository.port';
import { CARD_REQUEST_PROCESSOR_REPOSITORY } from './application/ports/card-request-processor.repository.port';
import { CARD_REQUESTED_DLQ_EVENT_PUBLISHER } from './application/ports/card-requested-dlq-event-publisher.port';
import { ProcessCardRequestedEventUseCase } from './application/use-cases/process-card-requested-event.use-case';
import { CardIssuanceFactory } from './domain/services/card-issuance.factory';
import { CardIssuedConsumer } from './infrastructure/messaging/consumers/card-issued.consumer';
import { CardRequestedConsumer } from './infrastructure/messaging/consumers/card-requested.consumer';
import { CardRequestedDlqConsumer } from './infrastructure/messaging/consumers/card-requested-dlq.consumer';
import { KafkaCardIssuedEventPublisher } from './infrastructure/messaging/publishers/kafka-card-issued-event.publisher';
import { KafkaCardRequestedDlqEventPublisher } from './infrastructure/messaging/publishers/kafka-card-requested-dlq-event.publisher';
import { CardRequestOrmRepository } from './infrastructure/persistence/repositories/card-processor-request-typeorm.repository';
import { CardOrmRepository } from './infrastructure/persistence/repositories/card-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
  providers: [
    ProcessCardRequestedEventUseCase,
    CardIssuanceFactory,
    CardIssuedConsumer,
    CardRequestedConsumer,
    CardRequestedDlqConsumer,
    KafkaCardIssuedEventPublisher,
    KafkaCardRequestedDlqEventPublisher,
    CardRequestOrmRepository,
    CardOrmRepository,
    {
      provide: CARD_REQUEST_PROCESSOR_REPOSITORY,
      useExisting: CardRequestOrmRepository,
    },
    {
      provide: CARD_PROCESSOR_REPOSITORY,
      useExisting: CardOrmRepository,
    },
    {
      provide: CARD_ISSUED_EVENT_PUBLISHER,
      useExisting: KafkaCardIssuedEventPublisher,
    },
    {
      provide: CARD_REQUESTED_DLQ_EVENT_PUBLISHER,
      useExisting: KafkaCardRequestedDlqEventPublisher,
    },
  ],
})
export class ProcessorModule {}
