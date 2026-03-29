import { CardRequest, type CardRequestedEventData } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import {
  CreateCardRequestCommand,
  CreateCardRequestResult,
} from '../dto/create-card-request.command';
import {
  CARD_REQUEST_EVENT_PUBLISHER,
  type CardRequestEventPublisherPort,
} from '../ports/card-request-event-publisher.port';
import type { CardRequestRepositoryPort } from '../ports/card-request-repository.port';
import { CARD_REQUEST_REPOSITORY } from '../ports/card-request-repository.port';

@Injectable()
export class CreateCardRequestUseCase {
  constructor(
    @Inject(CARD_REQUEST_REPOSITORY)
    private readonly cardRequestRepository: CardRequestRepositoryPort,
    @Inject(CARD_REQUEST_EVENT_PUBLISHER)
    private readonly cardRequestEventPublisher: CardRequestEventPublisherPort,
  ) {}

  async execute(
    command: CreateCardRequestCommand,
  ): Promise<CreateCardRequestResult> {
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

    const payload = createdCardRequest.toPrimitives();
    const event: CardRequestedEventData = {
      requestId: payload.id,
      forceError: command.forceError,
    };

    await this.cardRequestEventPublisher.publishRequested(event);

    return createdCardRequest.toPrimitives();
  }
}
