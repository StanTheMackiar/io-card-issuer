import { CardRequestStatus } from '@app/shared';
import { CreateCardRequestResult } from '../../../application/dto/create-card-request.command';

export class CardRequestResponseDto {
  id: string;
  idempotencyKey: string;
  customer: CreateCardRequestResult['customer'];
  product: CreateCardRequestResult['product'];
  status: CardRequestStatus;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  static from(cardRequest: CreateCardRequestResult): CardRequestResponseDto {
    return {
      id: cardRequest.id,
      idempotencyKey: cardRequest.idempotencyKey,
      customer: cardRequest.customer,
      product: cardRequest.product,
      status: cardRequest.status,
      requestedAt: cardRequest.requestedAt,
      createdAt: cardRequest.createdAt,
      updatedAt: cardRequest.updatedAt,
    };
  }
}
