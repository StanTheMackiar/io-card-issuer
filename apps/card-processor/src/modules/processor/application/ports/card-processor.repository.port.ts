import type { Card } from '../../domain/entities/card';

export const CARD_PROCESSOR_REPOSITORY = 'CARD_PROCESSOR_REPOSITORY';

export interface CardProcessorRepositoryPort {
  create(card: Card): Promise<Card>;
}
