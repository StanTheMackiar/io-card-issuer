import { CardOrmEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_REQUEST_EVENT_PUBLISHER } from './application/ports/card-request-event-publisher.port';
import { CARD_REQUEST_REPOSITORY } from './application/ports/card-request-repository.port';
import { CreateCardRequestUseCase } from './application/use-cases/create-card-request.use-case';
import { CardRequestsController } from './infrastructure/http/controllers/card-requests.controller';
import { KafkaCardRequestEventPublisher } from './infrastructure/messaging/publishers/kafka-card-request-event.publisher';
import { CardRequestOrmRepository } from './infrastructure/persistence/repositories/card-request-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
  controllers: [CardRequestsController],
  providers: [
    CreateCardRequestUseCase,
    CardRequestOrmRepository,
    KafkaCardRequestEventPublisher,
    {
      provide: CARD_REQUEST_REPOSITORY,
      useExisting: CardRequestOrmRepository,
    },
    {
      provide: CARD_REQUEST_EVENT_PUBLISHER,
      useExisting: KafkaCardRequestEventPublisher,
    },
  ],
})
export class CardsModule {}
