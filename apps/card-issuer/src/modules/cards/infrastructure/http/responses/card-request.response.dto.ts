import { CardRequestStatus } from '@app/shared';
import { Expose } from 'class-transformer';

export class CardRequestResponseDto {
  @Expose({ name: 'id' })
  requestId: string;

  @Expose()
  status: CardRequestStatus;
}
