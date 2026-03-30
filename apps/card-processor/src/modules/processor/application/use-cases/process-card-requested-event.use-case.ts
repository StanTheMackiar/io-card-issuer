import {
  CardRequestStatus,
  randomBoolean,
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
    const existingCard = await this.cardRepository.findByCardRequestId(
      cardRequestPrimitives.id,
    );

    if (existingCard) {
      await this.publishIssuedCard(cardRequestPrimitives.id, existingCard);

      return;
    }

    await sleep(400);

    if (!randomBoolean()) {
      throw new Error(
        `Card issuance simulation failed for request ${cardRequestPrimitives.id}`,
      );
    }

    const card = this.cardIssuanceFactory.create(cardRequestPrimitives.id);
    const createdCard = await this.cardRepository.create(card);

    await this.publishIssuedCard(cardRequestPrimitives.id, createdCard);
  }

  private async publishIssuedCard(
    requestId: string,
    card: Awaited<ReturnType<CardProcessorRepositoryPort['create']>>,
  ): Promise<void> {
    const cardPrimitives = card.toPrimitives();

    await this.cardRequestRepository.updateStatus(
      requestId,
      CardRequestStatus.ISSUED,
    );

    await this.cardIssuedEventPublisher.publishIssued({
      requestId,
      status: 'issued',
      card: {
        id: cardPrimitives.id,
        processorCardReference: cardPrimitives.processorCardReference,
        expirationDate: cardPrimitives.expirationDate,
        lastFour: cardPrimitives.lastFour,
      },
    });
  }
}
