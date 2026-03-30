import { type CardRequestedEventData } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import {
  CARD_REQUEST_EVENT_PUBLISHER,
  type CardRequestEventPublisherPort,
} from '../ports/card-request-event-publisher.port';
import {
  CARD_REQUEST_REPOSITORY,
  type CardRequestRepositoryPort,
} from '../ports/card-request-repository.port';

export type PublishPendingCardRequestEventsResult = {
  pendingCount: number;
  publishedCount: number;
  failedCount: number;
};

@Injectable()
export class PublishPendingCardRequestEventsUseCase {
  constructor(
    @Inject(CARD_REQUEST_REPOSITORY)
    private readonly cardRequestRepository: CardRequestRepositoryPort,
    @Inject(CARD_REQUEST_EVENT_PUBLISHER)
    private readonly cardRequestEventPublisher: CardRequestEventPublisherPort,
  ) {}

  async execute(limit: number): Promise<PublishPendingCardRequestEventsResult> {
    const pendingPublications =
      await this.cardRequestRepository.findPendingEventPublications(limit);
    let publishedCount = 0;
    let failedCount = 0;

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
        publishedCount += 1;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await this.cardRequestRepository.registerPublishFailure(
          payload.id,
          errorMessage,
        );
        failedCount += 1;
      }
    }

    return {
      pendingCount: pendingPublications.length,
      publishedCount,
      failedCount,
    };
  }
}
