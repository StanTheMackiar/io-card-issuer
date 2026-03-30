import {
  CardRequestStatus,
  TRANSACTION_MANAGER,
  randomBoolean,
  sleep,
  type CardRequestedEventData,
  type TransactionManagerPort,
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
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManagerPort,
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
      await this.cardRequestRepository.updateStatus(
        cardRequestPrimitives.id,
        CardRequestStatus.ISSUED,
      );
      await this.publishIssuedCard(cardRequestPrimitives.id, existingCard);

      return;
    }

    await sleep(400);

    if (!randomBoolean()) {
      throw new Error(
        `Card issuance simulation failed for request ${cardRequestPrimitives.id}`,
      );
    }

    const cardToPublish = await this.transactionManager.runInTransaction(
      async () => {
        const existingCard = await this.cardRepository.findByCardRequestId(
          cardRequestPrimitives.id,
        );

        if (existingCard) {
          await this.cardRequestRepository.updateStatus(
            cardRequestPrimitives.id,
            CardRequestStatus.ISSUED,
          );

          return existingCard;
        }

        const card = this.cardIssuanceFactory.create(cardRequestPrimitives.id);
        const createdCard = await this.cardRepository.create(card);

        await this.cardRequestRepository.updateStatus(
          cardRequestPrimitives.id,
          CardRequestStatus.ISSUED,
        );

        return createdCard;
      },
    );

    await this.publishIssuedCard(cardRequestPrimitives.id, cardToPublish);
  }

  private async publishIssuedCard(
    requestId: string,
    card: Awaited<ReturnType<CardProcessorRepositoryPort['create']>>,
  ): Promise<void> {
    const cardPrimitives = card.toPrimitives();

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
