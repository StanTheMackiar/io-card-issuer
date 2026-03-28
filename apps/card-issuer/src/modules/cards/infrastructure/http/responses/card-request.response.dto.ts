import { CardRequestStatus } from '@app/shared';
import { Expose, Type } from 'class-transformer';
import { CreateCardRequestResult } from '../../../application/dto/create-card-request.command';

class CustomerCardResponseDto {
  @Expose()
  documentType: CreateCardRequestResult['customer']['documentType'];

  @Expose()
  documentNumber: string;

  @Expose()
  fullName: string;

  @Expose()
  age: number;

  @Expose()
  email: string;
}

class ProductCardResponseDto {
  @Expose()
  type: CreateCardRequestResult['product']['type'];

  @Expose()
  currency: CreateCardRequestResult['product']['currency'];
}

export class CardRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  idempotencyKey: string;

  @Expose()
  @Type(() => CustomerCardResponseDto)
  customer: CustomerCardResponseDto;

  @Expose()
  @Type(() => ProductCardResponseDto)
  product: ProductCardResponseDto;

  @Expose()
  status: CardRequestStatus;

  @Expose()
  requestedAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
