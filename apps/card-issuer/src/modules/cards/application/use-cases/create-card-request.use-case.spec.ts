import { CardRequestStatus } from '@app/shared';
import { CardRequest } from '../../domain/entities/card-request';
import type { CardRequestRepositoryPort } from '../ports/card-request-repository.port';
import { CreateCardRequestUseCase } from './create-card-request.use-case';

describe('CreateCardRequestUseCase', () => {
  const command = {
    idempotencyKey: 'idem-123',
    customer: {
      documentType: 'DNI' as const,
      documentNumber: '10020030',
      fullName: 'Ada Lovelace',
      age: 28,
      email: 'ada@example.com',
    },
    product: {
      type: 'VISA' as const,
      currency: 'USD' as const,
    },
    forceError: false,
  };

  it('creates a new card request when the idempotency key does not exist', async () => {
    const findByIdempotencyKey = jest.fn().mockResolvedValue(null);
    const create = jest.fn((cardRequest: CardRequest) =>
      Promise.resolve(cardRequest),
    );
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey,
      create,
    };

    const useCase = new CreateCardRequestUseCase(repository);

    const result = await useCase.execute(command);

    expect(findByIdempotencyKey).toHaveBeenCalledWith('idem-123');
    expect(create).toHaveBeenCalledTimes(1);
    expect(result.idempotencyKey).toBe('idem-123');
    expect(result.status).toBe(CardRequestStatus.PENDING);
  });

  it('returns the existing card request when the idempotency key already exists', async () => {
    const existingCardRequest = CardRequest.rehydrate({
      id: 'request-1',
      idempotencyKey: 'idem-123',
      customer: command.customer,
      product: command.product,
      status: CardRequestStatus.PENDING,
      requestedAt: new Date('2026-03-26T10:00:00.000Z'),
      createdAt: new Date('2026-03-26T10:00:00.000Z'),
      updatedAt: new Date('2026-03-26T10:00:00.000Z'),
    });
    const findByIdempotencyKey = jest
      .fn()
      .mockResolvedValue(existingCardRequest);
    const create = jest.fn();
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey,
      create,
    };

    const useCase = new CreateCardRequestUseCase(repository);

    const result = await useCase.execute(command);

    expect(findByIdempotencyKey).toHaveBeenCalledWith('idem-123');
    expect(create).not.toHaveBeenCalled();
    expect(result).toEqual(existingCardRequest.toPrimitives());
  });

  it('throws an error when forceError is requested', async () => {
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey: jest.fn(),
      create: jest.fn(),
    };

    const useCase = new CreateCardRequestUseCase(repository);

    await expect(
      useCase.execute({
        ...command,
        forceError: true,
      }),
    ).rejects.toThrow('Forced error requested by issuer API contract');
  });
});
