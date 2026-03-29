import type { CardRequest } from '@app/shared';

export const CARD_REQUEST_REPOSITORY = 'CARD_REQUEST_REPOSITORY';

export interface CardRequestRepositoryPort {
  findByIdempotencyKey(idempotencyKey: string): Promise<CardRequest | null>;
  create(cardRequest: CardRequest): Promise<CardRequest>;
}
