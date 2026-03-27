import { CardEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CARD_REQUEST_REPOSITORY } from './application/ports/card-request-repository.port';
import { CreateCardRequestUseCase } from './application/use-cases/create-card-request.use-case';
import { CardRequestsController } from './infrastructure/http/controllers/card-requests.controller';
import { TypeOrmCardRequestRepository } from './infrastructure/persistence/repositories/card-request-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardEntity])],
  controllers: [CardRequestsController],
  providers: [
    CreateCardRequestUseCase,
    TypeOrmCardRequestRepository,
    {
      provide: CARD_REQUEST_REPOSITORY,
      useExisting: TypeOrmCardRequestRepository,
    },
  ],
})
export class CardsModule {}
