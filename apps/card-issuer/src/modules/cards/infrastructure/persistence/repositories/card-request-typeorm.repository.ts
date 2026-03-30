import {
  CardRequest,
  CardRequestOrmEntity,
  TypeOrmTransactionContext,
} from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  type CardRequestRepositoryPort,
  type PendingCardRequestPublication,
} from '../../../application/ports/card-request-repository.port';

@Injectable()
export class CardRequestOrmRepository implements CardRequestRepositoryPort {
  constructor(
    @InjectRepository(CardRequestOrmEntity)
    private readonly baseRepository: Repository<CardRequestOrmEntity>,
    private readonly transactionContext: TypeOrmTransactionContext,
  ) {}

  private get repository(): Repository<CardRequestOrmEntity> {
    const entityManager = this.transactionContext.getEntityManager();

    if (!entityManager) {
      return this.baseRepository;
    }

    return entityManager.getRepository(CardRequestOrmEntity);
  }

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
      processingAttempts: entity.processingAttempts,
      lastProcessingError: entity.lastProcessingError,
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

  async findByCustomerDocument(
    documentType: 'DNI',
    documentNumber: string,
  ): Promise<CardRequest | null> {
    const entity = await this.repository.findOne({
      where: {
        documentType,
        documentNumber,
      },
    });

    if (!entity) {
      return null;
    }

    return this.rehydrate(entity);
  }

  async create(
    cardRequest: CardRequest,
    forceError: boolean,
  ): Promise<CardRequest> {
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
      eventForceError: forceError,
      lastPublishError: primitives.lastPublishError,
      processingAttempts: primitives.processingAttempts,
      lastProcessingError: primitives.lastProcessingError,
      processedAt: null,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    const savedEntity = await this.repository.save(entity);

    return this.rehydrate(savedEntity);
  }

  async findPendingEventPublications(
    limit: number,
  ): Promise<PendingCardRequestPublication[]> {
    const entities = await this.repository.find({
      where: { eventPublishedAt: IsNull() },
      order: { createdAt: 'ASC' },
      take: limit,
    });

    return entities.map((entity) => ({
      cardRequest: this.rehydrate(entity),
      forceError: entity.eventForceError,
    }));
  }

  async markEventPublished(
    requestId: string,
    publishedAt: Date,
  ): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        eventPublishedAt: publishedAt,
        lastPublishError: null,
        eventPublishAttempts: () => 'event_publish_attempts + 1',
      },
    );
  }

  async registerPublishFailure(
    requestId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        lastPublishError: errorMessage,
        eventPublishAttempts: () => 'event_publish_attempts + 1',
      },
    );
  }
}
