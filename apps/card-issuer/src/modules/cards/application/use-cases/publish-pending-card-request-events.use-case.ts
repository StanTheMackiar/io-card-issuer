import { type CardRequestedEventData } from '@app/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CARD_REQUEST_EVENT_PUBLISHER,
  type CardRequestEventPublisherPort,
} from '../ports/card-request-event-publisher.port';
import {
  CARD_REQUEST_REPOSITORY,
  type CardRequestRepositoryPort,
} from '../ports/card-request-repository.port';

@Injectable()
export class PublishPendingCardRequestEventsUseCase {
  private readonly logger = new Logger(
    PublishPendingCardRequestEventsUseCase.name,
  );

  constructor(
    @Inject(CARD_REQUEST_REPOSITORY)
    private readonly cardRequestRepository: CardRequestRepositoryPort,
    @Inject(CARD_REQUEST_EVENT_PUBLISHER)
    private readonly cardRequestEventPublisher: CardRequestEventPublisherPort,
  ) {}

  async execute(limit: number): Promise<void> {
    const pendingPublications =
      await this.cardRequestRepository.findPendingEventPublications(limit);

    for (const pendingPublication of pendingPublications) {
      const payload = pendingPublication.cardRequest.toPrimitives();
      const event: CardRequestedEventData = {
        requestId: payload.id,
        forceError: pendingPublication.forceError,
      };

      try {
        await this.cardRequestEventPublisher.publishRequested(event);
        await this.cardRequestRepository.markEventPublished(
          payload.id,
          new Date(),
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(
          `Failed to publish pending card request event for requestId=${payload.id}: ${errorMessage}`,
        );

        await this.cardRequestRepository.registerPublishFailure(
          payload.id,
          errorMessage,
        );
      }
    }
  }
}
