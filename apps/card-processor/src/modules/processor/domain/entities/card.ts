import { CardStatus } from '@app/shared';
import { randomInt, randomUUID } from 'node:crypto';

type CardProps = {
  id: string;
  cardRequestId: string;
  processorCardReference: string;
  lastFour: string;
  status: CardStatus;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type CreateCardProps = {
  cardRequestId: string;
};

export class Card {
  private constructor(private readonly props: CardProps) {}

  static create(props: CreateCardProps): Card {
    const now = new Date();

    return new Card({
      id: randomUUID(),
      cardRequestId: props.cardRequestId,
      processorCardReference: randomUUID(),
      lastFour: String(randomInt(0, 10_000)).padStart(4, '0'),
      status: CardStatus.CREATED,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CardProps): Card {
    return new Card(props);
  }

  toPrimitives(): CardProps {
    return { ...this.props };
  }
}
