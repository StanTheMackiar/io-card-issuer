import {
  CardRequestStatus,
  type CardRequestCustomer,
  type CardRequestProduct,
} from '@app/shared';

export type CreateCardRequestCommand = {
  idempotencyKey: string;
  customer: CardRequestCustomer;
  product: CardRequestProduct;
  forceError: boolean;
};

export type CreateCardRequestResult = {
  id: string;
  idempotencyKey: string;
  customer: CardRequestCustomer;
  product: CardRequestProduct;
  status: CardRequestStatus;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
