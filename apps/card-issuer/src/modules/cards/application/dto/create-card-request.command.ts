import { CardRequestStatus } from '@app/shared';
import type {
  CardRequestCustomer,
  CardRequestProduct,
} from '../../domain/entities/card-request';

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
