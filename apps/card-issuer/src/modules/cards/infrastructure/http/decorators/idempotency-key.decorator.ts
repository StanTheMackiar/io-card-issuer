import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export const IdempotencyKey = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['idempotency-key'];
    const normalizedValue = Array.isArray(idempotencyKey)
      ? idempotencyKey[0]
      : idempotencyKey;

    if (!normalizedValue?.trim()) {
      throw new BadRequestException('idempotency-key header is required');
    }

    return normalizedValue.trim();
  },
);
