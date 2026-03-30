import { CardOrmEntity, TypeOrmTransactionContext } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type CardProcessorRepositoryPort } from '../../../application/ports/card-processor.repository.port';
import { Card } from '../../../domain/entities/card';

@Injectable()
export class CardOrmRepository implements CardProcessorRepositoryPort {
  constructor(
    @InjectRepository(CardOrmEntity)
    private readonly baseRepository: Repository<CardOrmEntity>,
    private readonly transactionContext: TypeOrmTransactionContext,
  ) {}

  private get repository(): Repository<CardOrmEntity> {
    const entityManager = this.transactionContext.getEntityManager();

    if (!entityManager) {
      return this.baseRepository;
    }

    return entityManager.getRepository(CardOrmEntity);
  }

  private rehydrate(entity: CardOrmEntity): Card {
    return Card.rehydrate({
      id: entity.id,
      cardRequestId: entity.cardRequestId,
      processorCardReference: entity.processorCardReference,
      expirationDate: entity.expirationDate,
      lastFour: entity.lastFour,
      status: entity.status,
      issuedAt: entity.issuedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  async create(card: Card): Promise<Card> {
    const primitives = card.toPrimitives();
    const entity: CardOrmEntity = this.repository.create({
      id: primitives.id,
      cardRequestId: primitives.cardRequestId,
      processorCardReference: primitives.processorCardReference,
      expirationDate: primitives.expirationDate,
      lastFour: primitives.lastFour,
      status: primitives.status,
      issuedAt: primitives.issuedAt,
    });
    const savedEntity: CardOrmEntity = await this.repository.save(entity);

    return this.rehydrate(savedEntity);
  }

  async findByCardRequestId(cardRequestId: string): Promise<Card | null> {
    const entity = await this.repository.findOne({
      where: { cardRequestId },
    });

    if (!entity) {
      return null;
    }

    return this.rehydrate(entity);
  }
}
