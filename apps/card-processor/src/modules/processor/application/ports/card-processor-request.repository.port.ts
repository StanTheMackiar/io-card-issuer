import type { CardRequest, CardRequestStatus } from '@app/shared';

export const CARD_PROCESSOR_REQUEST_REPOSITORY =
  'CARD_PROCESSOR_REQUEST_REPOSITORY';

export interface CardProcessorRequestRepositoryPort {
  findById(requestId: string): Promise<CardRequest | null>;
  updateStatus(requestId: string, status: CardRequestStatus): Promise<void>;
}
