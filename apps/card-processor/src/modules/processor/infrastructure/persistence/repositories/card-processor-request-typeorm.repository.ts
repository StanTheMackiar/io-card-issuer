import { CardRequestOrmEntity, type CardRequestStatus } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardProcessorRequestRepositoryPort } from '../../../application/ports/card-processor-request.repository.port';

@Injectable()
export class CardProcessorRequestTypeOrmRepository implements CardProcessorRequestRepositoryPort {
  constructor(
    @InjectRepository(CardRequestOrmEntity)
    private readonly repository: Repository<CardRequestOrmEntity>,
  ) {}

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
