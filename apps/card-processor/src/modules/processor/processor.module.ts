import { CardOrmEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_ISSUED_EVENT_PUBLISHER } from './application/ports/card-issued-event-publisher.port';
import { CARD_PROCESSOR_CARD_REPOSITORY } from './application/ports/card-processor-card.repository.port';
import { CARD_PROCESSOR_REQUEST_REPOSITORY } from './application/ports/card-processor-request.repository.port';
import { ProcessCardRequestedEventUseCase } from './application/use-cases/process-card-requested-event.use-case';
import { CardIssuanceFactory } from './domain/services/card-issuance.factory';
import { CardRequestedConsumer } from './infrastructure/messaging/consumers/card-requested.consumer';
import { KafkaCardIssuedEventPublisher } from './infrastructure/messaging/publishers/kafka-card-issued-event.publisher';
import { CardProcessorRequestTypeOrmRepository } from './infrastructure/persistence/repositories/card-processor-request-typeorm.repository';
import { CardOrmRepository } from './infrastructure/persistence/repositories/card-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
  providers: [
    ProcessCardRequestedEventUseCase,
    CardIssuanceFactory,
    CardRequestedConsumer,
    KafkaCardIssuedEventPublisher,
    CardProcessorRequestTypeOrmRepository,
    CardOrmRepository,
    {
      provide: CARD_PROCESSOR_REQUEST_REPOSITORY,
      useExisting: CardProcessorRequestTypeOrmRepository,
    },
    {
      provide: CARD_PROCESSOR_CARD_REPOSITORY,
      useExisting: CardOrmRepository,
    },
    {
      provide: CARD_ISSUED_EVENT_PUBLISHER,
      useExisting: KafkaCardIssuedEventPublisher,
    },
  ],
})
export class ProcessorModule {}
