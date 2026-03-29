import {
  CardRequest,
  CardRequestOrmEntity,
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
    private readonly repository: Repository<CardRequestOrmEntity>,
  ) {}

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

  async updateStatus(
    requestId: string,
    status: CardRequestStatus,
  ): Promise<void> {
    await this.repository.update(
      { id: requestId },
      {
        status,
        processedAt: new Date(),
      },
    );
  }
}
