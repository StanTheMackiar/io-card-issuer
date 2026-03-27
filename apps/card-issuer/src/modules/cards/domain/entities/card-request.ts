import { CardRequestStatus } from '@app/shared';
import { randomUUID } from 'node:crypto';

export type CardRequestCustomer = {
  documentType: 'DNI';
  documentNumber: string;
  fullName: string;
  age: number;
  email: string;
};

export type CardRequestProduct = {
  type: 'VISA';
  currency: 'PEN' | 'USD';
};

type CardRequestProps = {
  id: string;
  idempotencyKey: string;
  customer: CardRequestCustomer;
  product: CardRequestProduct;
  status: CardRequestStatus;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type CreateCardRequestProps = {
  idempotencyKey: string;
  customer: CardRequestCustomer;
  product: CardRequestProduct;
};

export class CardRequest {
  private constructor(private readonly props: CardRequestProps) {}

  static create(props: CreateCardRequestProps): CardRequest {
    const now = new Date();

    return new CardRequest({
      id: randomUUID(),
      idempotencyKey: props.idempotencyKey,
      customer: props.customer,
      product: props.product,
      status: CardRequestStatus.PENDING,
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CardRequestProps): CardRequest {
    return new CardRequest(props);
  }

  toPrimitives(): CardRequestProps {
    return {
      ...this.props,
      customer: { ...this.props.customer },
      product: { ...this.props.product },
    };
  }
}
