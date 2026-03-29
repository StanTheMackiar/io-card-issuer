import {
  CardRequestStatus,
  sleep,
  type CardRequestedEventData,
} from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { CardIssuanceFactory } from '../../domain/services/card-issuance.factory';
import {
  CARD_ISSUED_EVENT_PUBLISHER,
  type CardIssuedEventPublisherPort,
} from '../ports/card-issued-event-publisher.port';
import {
  CARD_PROCESSOR_REPOSITORY,
  type CardProcessorRepositoryPort,
} from '../ports/card-processor.repository.port';
import {
  CARD_REQUEST_PROCESSOR_REPOSITORY,
  type CardRequestRepositoryPort,
} from '../ports/card-request-processor.repository.port';

@Injectable()
export class ProcessCardRequestedEventUseCase {
  constructor(
    @Inject(CARD_REQUEST_PROCESSOR_REPOSITORY)
    private readonly cardRequestRepository: CardRequestRepositoryPort,
    @Inject(CARD_PROCESSOR_REPOSITORY)
    private readonly cardRepository: CardProcessorRepositoryPort,
    @Inject(CARD_ISSUED_EVENT_PUBLISHER)
    private readonly cardIssuedEventPublisher: CardIssuedEventPublisherPort,
    private readonly cardIssuanceFactory: CardIssuanceFactory,
  ) {}

  async execute(event: CardRequestedEventData): Promise<void> {
    if (event.forceError) {
      throw new Error('Forced card processing error');
    }

    const cardRequest = await this.cardRequestRepository.findById(
      event.requestId,
    );

    if (!cardRequest) {
      throw new Error(`Card request ${event.requestId} was not found`);
    }

    const cardRequestPrimitives = cardRequest.toPrimitives();

    await sleep(400);

    const card = this.cardIssuanceFactory.create(cardRequestPrimitives.id);
    const createdCard = await this.cardRepository.create(card);
    const createdCardPrimitives = createdCard.toPrimitives();

    await this.cardRequestRepository.updateStatus(
      cardRequestPrimitives.id,
      CardRequestStatus.ISSUED,
    );

    await this.cardIssuedEventPublisher.publishIssued({
      requestId: cardRequestPrimitives.id,
      status: 'issued',
      card: {
        id: createdCardPrimitives.id,
        processorCardReference: createdCardPrimitives.processorCardReference,
        lastFour: createdCardPrimitives.lastFour,
      },
    });
  }
}
