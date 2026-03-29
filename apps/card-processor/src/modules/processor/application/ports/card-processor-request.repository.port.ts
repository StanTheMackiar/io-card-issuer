import type { CardRequestStatus } from '@app/shared';

export const CARD_PROCESSOR_REQUEST_REPOSITORY =
  'CARD_PROCESSOR_REQUEST_REPOSITORY';

export interface CardProcessorRequestRepositoryPort {
  updateStatus(requestId: string, status: CardRequestStatus): Promise<void>;
}
