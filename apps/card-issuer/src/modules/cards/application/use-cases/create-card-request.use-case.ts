import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CardRequest } from '../../domain/entities/card-request';
import {
  CreateCardRequestCommand,
  CreateCardRequestResult,
} from '../dto/create-card-request.command';
import type { CardRequestRepositoryPort } from '../ports/card-request-repository.port';
import { CARD_REQUEST_REPOSITORY } from '../ports/card-request-repository.port';

@Injectable()
export class CreateCardRequestUseCase {
  constructor(
    @Inject(CARD_REQUEST_REPOSITORY)
    private readonly cardRequestRepository: CardRequestRepositoryPort,
  ) {}

  async execute(
    command: CreateCardRequestCommand,
  ): Promise<CreateCardRequestResult> {
    if (command.forceError) {
      throw new InternalServerErrorException(
        'Forced error requested by issuer API contract',
      );
    }

    const existingCardRequest =
      await this.cardRequestRepository.findByIdempotencyKey(
        command.idempotencyKey,
      );

    if (existingCardRequest) {
      return existingCardRequest.toPrimitives();
    }

    const cardRequest = CardRequest.create(command);
    const createdCardRequest =
      await this.cardRequestRepository.create(cardRequest);

    return createdCardRequest.toPrimitives();
  }
}
