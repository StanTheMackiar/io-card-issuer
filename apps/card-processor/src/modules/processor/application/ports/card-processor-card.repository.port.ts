import type { Card } from '../../domain/entities/card';

export const CARD_PROCESSOR_CARD_REPOSITORY = 'CARD_PROCESSOR_CARD_REPOSITORY';

export interface CardProcessorCardRepositoryPort {
  create(card: Card): Promise<Card>;
}
