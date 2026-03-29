import type { CardRequest } from '@app/shared';

export const CARD_REQUEST_REPOSITORY = 'CARD_REQUEST_REPOSITORY';

export type PendingCardRequestPublication = {
  cardRequest: CardRequest;
  forceError: boolean;
};

export interface CardRequestRepositoryPort {
  findByIdempotencyKey(idempotencyKey: string): Promise<CardRequest | null>;
  create(cardRequest: CardRequest, forceError: boolean): Promise<CardRequest>;
  findPendingEventPublications(
    limit: number,
  ): Promise<PendingCardRequestPublication[]>;
  markEventPublished(requestId: string, publishedAt: Date): Promise<void>;
  registerPublishFailure(
    requestId: string,
    errorMessage: string,
  ): Promise<void>;
}
