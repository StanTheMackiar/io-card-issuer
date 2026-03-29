import type { CardIssuedEventData } from '@app/shared';

export const CARD_ISSUED_EVENT_PUBLISHER = 'CARD_ISSUED_EVENT_PUBLISHER';

export interface CardIssuedEventPublisherPort {
  publishIssued(event: CardIssuedEventData): Promise<void>;
}
