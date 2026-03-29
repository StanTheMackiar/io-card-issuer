import { CardOrmEntity } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type CardProcessorRepositoryPort } from '../../../application/ports/card-processor.repository.port';
import { Card } from '../../../domain/entities/card';

@Injectable()
export class CardOrmRepository implements CardProcessorRepositoryPort {
  constructor(
    @InjectRepository(CardOrmEntity)
    private readonly repository: Repository<CardOrmEntity>,
  ) {}

  async create(card: Card): Promise<Card> {
    const primitives = card.toPrimitives();
    const entity: CardOrmEntity = this.repository.create({
      id: primitives.id,
      cardRequestId: primitives.cardRequestId,
      processorCardReference: primitives.processorCardReference,
      lastFour: primitives.lastFour,
      status: primitives.status,
      issuedAt: primitives.issuedAt,
    });
    const savedEntity: CardOrmEntity = await this.repository.save(entity);

    return Card.rehydrate({
      id: savedEntity.id,
      cardRequestId: savedEntity.cardRequestId,
      processorCardReference: savedEntity.processorCardReference,
      lastFour: savedEntity.lastFour,
      status: savedEntity.status,
      issuedAt: savedEntity.issuedAt,
      createdAt: savedEntity.createdAt,
      updatedAt: savedEntity.updatedAt,
    });
  }
}
