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
  CARD_PROCESSOR_CARD_REPOSITORY,
  type CardProcessorCardRepositoryPort,
} from '../ports/card-processor-card.repository.port';
import {
  CARD_PROCESSOR_REQUEST_REPOSITORY,
  type CardProcessorRequestRepositoryPort,
} from '../ports/card-processor-request.repository.port';

@Injectable()
export class ProcessCardRequestedEventUseCase {
  constructor(
    @Inject(CARD_PROCESSOR_REQUEST_REPOSITORY)
    private readonly cardRequestRepository: CardProcessorRequestRepositoryPort,
    @Inject(CARD_PROCESSOR_CARD_REPOSITORY)
    private readonly cardRepository: CardProcessorCardRepositoryPort,
    @Inject(CARD_ISSUED_EVENT_PUBLISHER)
    private readonly cardIssuedEventPublisher: CardIssuedEventPublisherPort,
    private readonly cardIssuanceFactory: CardIssuanceFactory,
  ) {}

  async execute(event: CardRequestedEventData): Promise<void> {
    if (event.forceError) {
      throw new Error('Forced card processing error');
    }

    await sleep(400);

    const card = this.cardIssuanceFactory.create(event.requestId);
    const createdCard = await this.cardRepository.create(card);
    const createdCardPrimitives = createdCard.toPrimitives();

    await this.cardRequestRepository.updateStatus(
      event.requestId,
      CardRequestStatus.ISSUED,
    );

    await this.cardIssuedEventPublisher.publishIssued({
      requestId: event.requestId,
      status: 'issued',
      card: {
        id: createdCardPrimitives.id,
        processorCardReference: createdCardPrimitives.processorCardReference,
        lastFour: createdCardPrimitives.lastFour,
      },
    });
  }
}
