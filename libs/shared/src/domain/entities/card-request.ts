import { randomUUID } from 'node:crypto';
import { CardRequestStatus } from '../../database/enums/card-request-status.enum';

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
  eventPublishedAt: Date | null;
  eventPublishAttempts: number;
  lastPublishError: string | null;
  processedAt: Date | null;
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
      eventPublishedAt: null,
      eventPublishAttempts: 0,
      lastPublishError: null,
      processedAt: null,
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
