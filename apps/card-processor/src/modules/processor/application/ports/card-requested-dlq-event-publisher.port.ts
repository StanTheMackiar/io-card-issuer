import type { CardRequestedDlqEventData } from '@app/shared';

export const CARD_REQUESTED_DLQ_EVENT_PUBLISHER =
  'CARD_REQUESTED_DLQ_EVENT_PUBLISHER';

export interface CardRequestedDlqEventPublisherPort {
  publishDlq(event: CardRequestedDlqEventData): Promise<void>;
}
