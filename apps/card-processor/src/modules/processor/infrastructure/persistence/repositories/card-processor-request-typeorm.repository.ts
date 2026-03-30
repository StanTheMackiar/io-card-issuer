import {
  CardRequest,
  CardRequestOrmEntity,
  TypeOrmTransactionContext,
  type CardRequestStatus,
} from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type CardRequestRepositoryPort } from '../../../application/ports/card-request-processor.repository.port';

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

  private rehydrateCardRequest(cardRequest: CardRequestOrmEntity): CardRequest {
    return CardRequest.rehydrate({
      id: cardRequest.id,
      idempotencyKey: cardRequest.idempotencyKey,
      customer: {
        documentType: cardRequest.documentType,
        documentNumber: cardRequest.documentNumber,
        fullName: cardRequest.fullName,
        age: cardRequest.age,
        email: cardRequest.email,
      },
      product: {
        type: cardRequest.productType,
        currency: cardRequest.currency,
      },
      status: cardRequest.status,
      requestedAt: cardRequest.requestedAt,
      eventPublishedAt: cardRequest.eventPublishedAt,
      eventPublishAttempts: cardRequest.eventPublishAttempts,
      lastPublishError: cardRequest.lastPublishError,
      processingAttempts: cardRequest.processingAttempts,
      lastProcessingError: cardRequest.lastProcessingError,
      processedAt: cardRequest.processedAt,
      createdAt: cardRequest.createdAt,
      updatedAt: cardRequest.updatedAt,
    });
  }

  async findById(requestId: string): Promise<CardRequest | null> {
    const cardRequest = await this.repository.findOne({
      where: { id: requestId },
    });

    if (!cardRequest) {
      return null;
    }

    return this.rehydrateCardRequest(cardRequest);
  }

  async registerProcessingAttempt(requestId: string): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        processingAttempts: () => 'processing_attempts + 1',
      },
    );
  }

  async updateStatus(
    requestId: string,
    status: CardRequestStatus,
    lastProcessingError: string | null = null,
  ): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        status,
        lastProcessingError,
        processedAt: new Date(),
      },
    );
  }

  async registerProcessingFailure(
    requestId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        lastProcessingError: errorMessage,
      },
    );
  }
}
