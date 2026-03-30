import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCardRequestUseCase } from '../../../application/use-cases/create-card-request.use-case';
import { CustomerAlreadyHasCardRequestError } from '../../../domain/errors/customer-already-has-card-request.error';
import { IdempotencyKey } from '../decorators/idempotency-key.decorator';
import { CreateCardRequestDto } from '../requests/create-card-request.dto';
import { CardRequestResponseDto } from '../responses/card-request.response.dto';

@Controller('cards')
export class CardRequestsController {
  private readonly logger = new Logger(CardRequestsController.name);

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
    this.logger.log(
      `Received card issue request with idempotencyKey=${idempotencyKey}`,
    );

    try {
      const cardRequest = await this.createCardRequestUseCase.execute({
        idempotencyKey,
        ...body,
      });

      this.logger.log(
        `Card issue request accepted with requestId=${cardRequest.id} and status=${cardRequest.status}`,
      );

      return cardRequest;
    } catch (error: unknown) {
      if (error instanceof CustomerAlreadyHasCardRequestError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
