import { Injectable } from '@nestjs/common';
import { Card } from '../entities/card';

@Injectable()
export class CardIssuanceFactory {
  create(cardRequestId: string): Card {
    return Card.create({
      cardRequestId,
    });
  }
}
