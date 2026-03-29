import { CardRequest, CardRequestOrmEntity } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardRequestRepositoryPort } from '../../../application/ports/card-request-repository.port';

@Injectable()
export class CardRequestOrmRepository implements CardRequestRepositoryPort {
  constructor(
    @InjectRepository(CardRequestOrmEntity)
    private readonly repository: Repository<CardRequestOrmEntity>,
  ) {}

  private rehydrate(entity: CardRequestOrmEntity): CardRequest {
    return CardRequest.rehydrate({
      id: entity.id,
      idempotencyKey: entity.idempotencyKey,
      customer: {
        documentType: entity.documentType,
        documentNumber: entity.documentNumber,
        fullName: entity.fullName,
        age: entity.age,
        email: entity.email,
      },
      product: {
        type: entity.productType,
        currency: entity.currency,
      },
      status: entity.status,
      requestedAt: entity.requestedAt,
      eventPublishedAt: entity.eventPublishedAt,
      eventPublishAttempts: entity.eventPublishAttempts,
      lastPublishError: entity.lastPublishError,
      processedAt: entity.processedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<CardRequest | null> {
    const entity = await this.repository.findOne({
      where: { idempotencyKey },
    });

    if (!entity) {
      return null;
    }

    return this.rehydrate(entity);
  }

  async create(cardRequest: CardRequest): Promise<CardRequest> {
    const primitives = cardRequest.toPrimitives();
    const entity = this.repository.create({
      id: primitives.id,
      idempotencyKey: primitives.idempotencyKey,
      documentType: primitives.customer.documentType,
      documentNumber: primitives.customer.documentNumber,
      fullName: primitives.customer.fullName,
      age: primitives.customer.age,
      email: primitives.customer.email,
      productType: primitives.product.type,
      currency: primitives.product.currency,
      status: primitives.status,
      requestedAt: primitives.requestedAt,
      eventPublishedAt: primitives.eventPublishedAt,
      eventPublishAttempts: primitives.eventPublishAttempts,
      lastPublishError: primitives.lastPublishError,
      processedAt: null,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    const savedEntity = await this.repository.save(entity);

    return this.rehydrate(savedEntity);
  }
}
