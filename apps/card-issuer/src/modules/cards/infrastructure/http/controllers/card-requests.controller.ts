import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCardRequestUseCase } from '../../../application/use-cases/create-card-request.use-case';
import { IdempotencyKey } from '../decorators/idempotency-key.decorator';
import { CreateCardRequestDto } from '../requests/create-card-request.dto';
import { CardRequestResponseDto } from '../responses/card-request.response.dto';

@Controller('cards')
export class CardRequestsController {
  constructor(
    private readonly createCardRequestUseCase: CreateCardRequestUseCase,
  ) {}

  @Post('issue')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: CardRequestResponseDto,
    excludeExtraneousValues: true,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @IdempotencyKey() idempotencyKey: string,
    @Body() body: CreateCardRequestDto,
  ) {
    const cardRequest = await this.createCardRequestUseCase.execute({
      idempotencyKey,
      ...body,
    });

    return cardRequest;
  }
}
