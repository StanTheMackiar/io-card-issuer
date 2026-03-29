import { CardRequest, CardRequestStatus } from '@app/shared';
import type { CardRequestEventPublisherPort } from '../ports/card-request-event-publisher.port';
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
    const publishRequested = jest.fn().mockResolvedValue(undefined);
    const markEventPublished = jest.fn().mockResolvedValue(undefined);
    const registerPublishFailure = jest.fn().mockResolvedValue(undefined);
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey,
      create,
      findPendingEventPublications: jest.fn(),
      markEventPublished,
      registerPublishFailure,
    };
    const publisher: CardRequestEventPublisherPort = {
      publishRequested,
    };

    const useCase = new CreateCardRequestUseCase(repository, publisher);

    const result = await useCase.execute(command);

    expect(findByIdempotencyKey).toHaveBeenCalledWith('idem-123');
    expect(create).toHaveBeenCalledWith(expect.any(CardRequest), false);
    expect(publishRequested).toHaveBeenCalledWith({
      requestId: result.id,
      forceError: false,
    });
    expect(markEventPublished).toHaveBeenCalledWith(
      result.id,
      expect.any(Date),
    );
    expect(registerPublishFailure).not.toHaveBeenCalled();
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
      eventPublishedAt: null,
      eventPublishAttempts: 0,
      lastPublishError: null,
      processedAt: null,
      createdAt: new Date('2026-03-26T10:00:00.000Z'),
      updatedAt: new Date('2026-03-26T10:00:00.000Z'),
    });
    const findByIdempotencyKey = jest
      .fn()
      .mockResolvedValue(existingCardRequest);
    const create = jest.fn();
    const publishRequested = jest.fn();
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey,
      create,
      findPendingEventPublications: jest.fn(),
      markEventPublished: jest.fn(),
      registerPublishFailure: jest.fn(),
    };
    const publisher: CardRequestEventPublisherPort = {
      publishRequested,
    };

    const useCase = new CreateCardRequestUseCase(repository, publisher);

    const result = await useCase.execute(command);

    expect(findByIdempotencyKey).toHaveBeenCalledWith('idem-123');
    expect(create).not.toHaveBeenCalled();
    expect(publishRequested).not.toHaveBeenCalled();
    expect(result).toEqual(existingCardRequest.toPrimitives());
  });

  it('publishes the event even when forceError is requested', async () => {
    const publishRequested = jest.fn().mockResolvedValue(undefined);
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      create: jest.fn((cardRequest: CardRequest) =>
        Promise.resolve(cardRequest),
      ),
      findPendingEventPublications: jest.fn(),
      markEventPublished: jest.fn().mockResolvedValue(undefined),
      registerPublishFailure: jest.fn().mockResolvedValue(undefined),
    };
    const publisher: CardRequestEventPublisherPort = {
      publishRequested,
    };

    const useCase = new CreateCardRequestUseCase(repository, publisher);

    await expect(
      useCase.execute({
        ...command,
        forceError: true,
      }),
    ).resolves.toBeDefined();
    expect(publishRequested).toHaveBeenCalledWith(
      expect.objectContaining({
        forceError: true,
      }),
    );
  });

  it('stores the request and records a publish failure when the event publish fails', async () => {
    const registerPublishFailure = jest.fn().mockResolvedValue(undefined);
    const markEventPublished = jest.fn();
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      create: jest.fn((cardRequest: CardRequest) =>
        Promise.resolve(cardRequest),
      ),
      findPendingEventPublications: jest.fn(),
      markEventPublished,
      registerPublishFailure,
    };
    const publisher: CardRequestEventPublisherPort = {
      publishRequested: jest.fn().mockRejectedValue(new Error('kafka down')),
    };

    const useCase = new CreateCardRequestUseCase(repository, publisher);

    const result = await useCase.execute(command);

    expect(result.status).toBe(CardRequestStatus.PENDING);
    expect(registerPublishFailure).toHaveBeenCalledWith(
      result.id,
      'kafka down',
    );
    expect(markEventPublished).not.toHaveBeenCalled();
  });

  it('does not register a publish failure when the event is published but marking it fails', async () => {
    const markEventPublished = jest
      .fn()
      .mockRejectedValue(new Error('db update failed'));
    const registerPublishFailure = jest.fn().mockResolvedValue(undefined);
    const repository: CardRequestRepositoryPort = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      create: jest.fn((cardRequest: CardRequest) =>
        Promise.resolve(cardRequest),
      ),
      findPendingEventPublications: jest.fn(),
      markEventPublished,
      registerPublishFailure,
    };
    const publisher: CardRequestEventPublisherPort = {
      publishRequested: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CreateCardRequestUseCase(repository, publisher);

    const result = await useCase.execute(command);

    expect(result.status).toBe(CardRequestStatus.PENDING);
    expect(markEventPublished).toHaveBeenCalledWith(
      result.id,
      expect.any(Date),
    );
    expect(registerPublishFailure).not.toHaveBeenCalled();
  });
});
