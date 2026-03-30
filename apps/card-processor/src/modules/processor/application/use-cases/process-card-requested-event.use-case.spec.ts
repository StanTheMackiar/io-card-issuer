import { CardRequest, CardRequestStatus, CardStatus } from '@app/shared';
import { Card } from '../../domain/entities/card';
import { CardIssuanceFactory } from '../../domain/services/card-issuance.factory';
import type { CardIssuedEventPublisherPort } from '../ports/card-issued-event-publisher.port';
import type { CardProcessorRepositoryPort } from '../ports/card-processor.repository.port';
import type { CardRequestRepositoryPort } from '../ports/card-request-processor.repository.port';
import { ProcessCardRequestedEventUseCase } from './process-card-requested-event.use-case';

describe('ProcessCardRequestedEventUseCase', () => {
  let cardRequestRepository: jest.Mocked<CardRequestRepositoryPort>;
  let cardRepository: jest.Mocked<CardProcessorRepositoryPort>;
  let cardIssuedEventPublisher: jest.Mocked<CardIssuedEventPublisherPort>;
  let useCase: ProcessCardRequestedEventUseCase;

  beforeEach(() => {
    cardRequestRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    cardRepository = {
      create: jest.fn(),
      findByCardRequestId: jest.fn(),
    };

    cardIssuedEventPublisher = {
      publishIssued: jest.fn(),
    };

    useCase = new ProcessCardRequestedEventUseCase(
      cardRequestRepository,
      cardRepository,
      cardIssuedEventPublisher,
      new CardIssuanceFactory(),
    );
  });

  it('reuses the existing card when the request was already processed', async () => {
    const cardRequest = CardRequest.rehydrate({
      id: 'request-1',
      idempotencyKey: 'idem-1',
      customer: {
        documentType: 'DNI',
        documentNumber: '12345678',
        fullName: 'Jane Doe',
        age: 30,
        email: 'jane@example.com',
      },
      product: {
        type: 'VISA',
        currency: 'PEN',
      },
      status: CardRequestStatus.PENDING,
      requestedAt: new Date('2025-01-01T00:00:00.000Z'),
      eventPublishedAt: new Date('2025-01-01T00:00:01.000Z'),
      eventPublishAttempts: 1,
      lastPublishError: null,
      processedAt: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    });
    const existingCard = Card.rehydrate({
      id: 'card-1',
      cardRequestId: 'request-1',
      processorCardReference: 'processor-ref-1',
      expirationDate: '12/28',
      lastFour: '1111',
      status: CardStatus.CREATED,
      issuedAt: new Date('2025-01-01T00:00:02.000Z'),
      createdAt: new Date('2025-01-01T00:00:02.000Z'),
      updatedAt: new Date('2025-01-01T00:00:02.000Z'),
    });

    cardRequestRepository.findById.mockResolvedValue(cardRequest);
    cardRepository.findByCardRequestId.mockResolvedValue(existingCard);

    await useCase.execute({
      requestId: 'request-1',
      forceError: false,
    });

    expect(cardRepository.create.mock.calls).toHaveLength(0);
    expect(cardRequestRepository.updateStatus.mock.calls).toContainEqual([
      'request-1',
      CardRequestStatus.ISSUED,
    ]);
    expect(cardIssuedEventPublisher.publishIssued.mock.calls).toContainEqual([
      {
        requestId: 'request-1',
        status: 'issued',
        card: {
          id: 'card-1',
          processorCardReference: 'processor-ref-1',
          expirationDate: '12/28',
          lastFour: '1111',
        },
      },
    ]);
  });
});
