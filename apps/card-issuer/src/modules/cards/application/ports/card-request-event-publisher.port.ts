import type { CardRequestedEventData } from '@app/shared';

export const CARD_REQUEST_EVENT_PUBLISHER = 'CARD_REQUEST_EVENT_PUBLISHER';

export interface CardRequestEventPublisherPort {
  publishRequested(event: CardRequestedEventData): Promise<void>;
}
