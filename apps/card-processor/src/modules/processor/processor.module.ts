import { CardOrmEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_ISSUED_EVENT_PUBLISHER } from './application/ports/card-issued-event-publisher.port';
import { CARD_PROCESSOR_REPOSITORY } from './application/ports/card-processor.repository.port';
import { CARD_REQUEST_PROCESSOR_REPOSITORY } from './application/ports/card-request-processor.repository.port';
import { ProcessCardRequestedEventUseCase } from './application/use-cases/process-card-requested-event.use-case';
import { CardIssuanceFactory } from './domain/services/card-issuance.factory';
import { CardRequestedConsumer } from './infrastructure/messaging/consumers/card-requested.consumer';
import { KafkaCardIssuedEventPublisher } from './infrastructure/messaging/publishers/kafka-card-issued-event.publisher';
import { CardRequestOrmRepository } from './infrastructure/persistence/repositories/card-processor-request-typeorm.repository';
import { CardOrmRepository } from './infrastructure/persistence/repositories/card-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
  providers: [
    ProcessCardRequestedEventUseCase,
    CardIssuanceFactory,
    CardRequestedConsumer,
    KafkaCardIssuedEventPublisher,
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
  ],
})
export class ProcessorModule {}
