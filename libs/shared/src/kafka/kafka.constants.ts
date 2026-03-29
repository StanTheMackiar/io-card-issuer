export const KAFKA_TOPICS = {
  CARD_REQUESTED_V1: 'io.card.requested.v1',
  CARD_REQUESTED_V1_DLQ: 'io.card.requested.v1.dlq',
  CARD_ISSUED_V1: 'io.cards.issued.v1',
} as const;

export const KAFKA_EVENT_IDS = {
  CARD_REQUESTED: '1',
  CARD_REQUESTED_DLQ: '2',
  CARD_ISSUED: '3',
} as const;
