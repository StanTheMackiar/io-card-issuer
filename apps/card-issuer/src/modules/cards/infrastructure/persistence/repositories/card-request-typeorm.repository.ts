import { CardRequestOrmEntity } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardRequestRepositoryPort } from '../../../application/ports/card-request-repository.port';
import { CardRequest } from '../../../domain/entities/card-request';

@Injectable()
export class CardRequestOrmRepository implements CardRequestRepositoryPort {
  constructor(
    @InjectRepository(CardRequestOrmEntity)
    private readonly repository: Repository<CardRequestOrmEntity>,
  ) {}

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<CardRequest | null> {
    const entity = await this.repository.findOne({
      where: { idempotencyKey },
    });

    if (!entity) {
      return null;
    }

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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
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
      processedAt: null,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    const savedEntity = await this.repository.save(entity);

    return CardRequest.rehydrate({
      id: savedEntity.id,
      idempotencyKey: savedEntity.idempotencyKey,
      customer: {
        documentType: savedEntity.documentType,
        documentNumber: savedEntity.documentNumber,
        fullName: savedEntity.fullName,
        age: savedEntity.age,
        email: savedEntity.email,
      },
      product: {
        type: savedEntity.productType,
        currency: savedEntity.currency,
      },
      status: savedEntity.status,
      requestedAt: savedEntity.requestedAt,
      createdAt: savedEntity.createdAt,
      updatedAt: savedEntity.updatedAt,
    });
  }
}
