import {
  CardOrmEntity,
  CardRequestOrmEntity,
  TRANSACTION_MANAGER,
  TypeOrmTransactionContext,
  TypeOrmTransactionManager,
} from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_REQUEST_EVENT_PUBLISHER } from './application/ports/card-request-event-publisher.port';
import { CARD_REQUEST_REPOSITORY } from './application/ports/card-request-repository.port';
import { CreateCardRequestUseCase } from './application/use-cases/create-card-request.use-case';
import { PublishPendingCardRequestEventsUseCase } from './application/use-cases/publish-pending-card-request-events.use-case';
import { CardRequestsController } from './infrastructure/http/controllers/card-requests.controller';
import { KafkaTopicsBootstrap } from './infrastructure/messaging/kafka-topics.bootstrap';
import { KafkaCardRequestEventPublisher } from './infrastructure/messaging/publishers/kafka-card-request-event.publisher';
import { CardRequestOrmRepository } from './infrastructure/persistence/repositories/card-request-typeorm.repository';
import { CardRequestPublicationScheduler } from './infrastructure/scheduling/card-request-publication.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
  controllers: [CardRequestsController],
  providers: [
    CreateCardRequestUseCase,
    PublishPendingCardRequestEventsUseCase,
    TypeOrmTransactionContext,
    TypeOrmTransactionManager,
    CardRequestOrmRepository,
    KafkaTopicsBootstrap,
    KafkaCardRequestEventPublisher,
    CardRequestPublicationScheduler,
    {
      provide: CARD_REQUEST_REPOSITORY,
      useExisting: CardRequestOrmRepository,
    },
    {
      provide: CARD_REQUEST_EVENT_PUBLISHER,
      useExisting: KafkaCardRequestEventPublisher,
    },
    {
      provide: TRANSACTION_MANAGER,
      useExisting: TypeOrmTransactionManager,
    },
  ],
})
export class CardsModule {}
