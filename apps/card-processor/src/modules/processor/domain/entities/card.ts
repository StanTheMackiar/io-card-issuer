import { CardStatus } from '@app/shared';
import { randomInt, randomUUID } from 'node:crypto';

type CardProps = {
  id: string;
  cardRequestId: string;
  processorCardReference: string;
  expirationDate: string;
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
    const cardNumber = generateCardNumber();
    /* The challenge mentions constructing the full card, including card number and CVV. We generate them here as part of the issuance flow, but keep those values transient: in production they should not be persisted or emitted.*/

    const cvv = generateCvv();
    void cvv;

    return new Card({
      id: randomUUID(),
      cardRequestId: props.cardRequestId,
      processorCardReference: randomUUID(),
      expirationDate: generateExpirationDate(),
      lastFour: cardNumber.slice(-4),
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

function generateCardNumber(): string {
  return `4${String(randomInt(0, 10 ** 15)).padStart(15, '0')}`;
}

function generateExpirationDate(): string {
  const month = String(randomInt(1, 13)).padStart(2, '0');
  const year = String((new Date().getFullYear() + 3) % 100).padStart(2, '0');

  return `${month}/${year}`;
}

function generateCvv(): string {
  return String(randomInt(0, 1000)).padStart(3, '0');
}
