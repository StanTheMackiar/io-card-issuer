import type { CardRequest, CardRequestStatus } from '@app/shared';

export const CARD_REQUEST_PROCESSOR_REPOSITORY =
  'CARD_REQUEST_PROCESSOR_REPOSITORY';

export interface CardRequestRepositoryPort {
  findById(requestId: string): Promise<CardRequest | null>;
  updateStatus(requestId: string, status: CardRequestStatus): Promise<void>;
}
