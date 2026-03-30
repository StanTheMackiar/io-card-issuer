import {
  CardRequest,
  TRANSACTION_MANAGER,
  type CardRequestedEventData,
  type TransactionManagerPort,
} from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { CustomerAlreadyHasCardRequestError } from '../../domain/errors/customer-already-has-card-request.error';
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
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManagerPort,
    @Inject(CARD_REQUEST_EVENT_PUBLISHER)
    private readonly cardRequestEventPublisher: CardRequestEventPublisherPort,
  ) {}

  async execute(
    command: CreateCardRequestCommand,
  ): Promise<CreateCardRequestResult> {
    const { cardRequest, wasCreated } =
      await this.transactionManager.runInTransaction(async () => {
        const existingCardRequest =
          await this.cardRequestRepository.findByIdempotencyKey(
            command.idempotencyKey,
          );

        if (existingCardRequest) {
          return {
            cardRequest: existingCardRequest,
            wasCreated: false,
          };
        }

        const existingCustomerCardRequest =
          await this.cardRequestRepository.findByCustomerDocument(
            command.customer.documentType,
            command.customer.documentNumber,
          );

        if (existingCustomerCardRequest) {
          throw new CustomerAlreadyHasCardRequestError(
            command.customer.documentNumber,
          );
        }

        const newCardRequest = CardRequest.create(command);
        const createdCardRequest = await this.cardRequestRepository.create(
          newCardRequest,
          command.forceError,
        );

        return {
          cardRequest: createdCardRequest,
          wasCreated: true,
        };
      });

    if (!wasCreated) {
      return cardRequest.toPrimitives();
    }

    const payload = cardRequest.toPrimitives();
    const event: CardRequestedEventData = {
      requestId: payload.id,
      forceError: command.forceError,
    };

    try {
      await this.cardRequestEventPublisher.publishRequested(event);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.cardRequestRepository.registerPublishFailure(
        payload.id,
        errorMessage,
      );

      return cardRequest.toPrimitives();
    }

    try {
      await this.cardRequestRepository.markEventPublished(
        payload.id,
        new Date(),
      );
    } catch {
      return cardRequest.toPrimitives();
    }

    return cardRequest.toPrimitives();
  }
}
