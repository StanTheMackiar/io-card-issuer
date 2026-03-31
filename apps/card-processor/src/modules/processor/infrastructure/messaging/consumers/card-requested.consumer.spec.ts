import type {
  CardRequestedDlqEventData,
  CardRequestedEvent,
} from '@app/shared';
import { KAFKA_TOPICS, sleep } from '@app/shared';
import type { ConfigService } from '@nestjs/config';
import type { CardRequestRepositoryPort } from '../../../application/ports/card-request-processor.repository.port';
import type { CardRequestedDlqEventPublisherPort } from '../../../application/ports/card-requested-dlq-event-publisher.port';
import { ProcessCardRequestedEventUseCase } from '../../../application/use-cases/process-card-requested-event.use-case';
import { CardRequestedConsumer } from './card-requested.consumer';

type EachMessagePayload = { message: { value: Buffer | null } };
type EachMessageHandler = (payload: EachMessagePayload) => Promise<void>;
type KafkaRunConfig = { eachMessage: EachMessageHandler };

const mockKafkaRun = jest.fn<Promise<void>, [KafkaRunConfig]>();
const mockKafkaSubscribe = jest.fn<Promise<void>, [unknown]>();
const mockKafkaConnect = jest.fn<Promise<void>, []>();
const mockKafkaDisconnect = jest.fn<Promise<void>, []>();
const mockKafkaConsumer = jest.fn(() => ({
  connect: mockKafkaConnect,
  subscribe: mockKafkaSubscribe,
  run: mockKafkaRun,
  disconnect: mockKafkaDisconnect,
}));

jest.mock('@app/shared', () => {
  const actual =
    jest.requireActual<typeof import('@app/shared')>('@app/shared');

  return {
    ...actual,
    sleep: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn(() => ({
      consumer: mockKafkaConsumer,
    })),
  };
});

describe('CardRequestedConsumer', () => {
  let configService: jest.Mocked<ConfigService>;
  let processCardRequestedEventUseCase: jest.Mocked<ProcessCardRequestedEventUseCase>;
  let cardRequestRepository: jest.Mocked<CardRequestRepositoryPort>;
  let cardRequestedDlqEventPublisher: jest.Mocked<CardRequestedDlqEventPublisherPort>;
  let consumer: CardRequestedConsumer;

  const mockedSleep = jest.mocked(sleep);

  const event: CardRequestedEvent = {
    id: 'event-1',
    source: 'request-1',
    type: KAFKA_TOPICS.CARD_REQUESTED_V1,
    time: '2026-03-30T00:00:00.000Z',
    data: {
      requestId: 'request-1',
      forceError: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'kafka.clientId') {
          return 'io-card-platform';
        }

        if (key === 'kafka.brokers') {
          return ['localhost:9092'];
        }

        if (key === 'kafka.processorGroupId') {
          return 'card-processor-group';
        }

        throw new Error(`Unexpected config key: ${key}`);
      }),
    } as unknown as jest.Mocked<ConfigService>;

    processCardRequestedEventUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ProcessCardRequestedEventUseCase>;

    cardRequestRepository = {
      findById: jest.fn(),
      registerProcessingAttempt: jest.fn().mockResolvedValue(undefined),
      registerProcessingFailure: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };

    cardRequestedDlqEventPublisher = {
      publishDlq: jest.fn().mockResolvedValue(undefined),
    };

    consumer = new CardRequestedConsumer(
      configService,
      processCardRequestedEventUseCase,
      cardRequestRepository,
      cardRequestedDlqEventPublisher,
    );
  });

  it('retries with incremental delays and succeeds on the third attempt', async () => {
    processCardRequestedEventUseCase.execute
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValueOnce(undefined);

    const eachMessage = await startConsumerAndGetHandler();

    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(event)),
      },
    });

    expect(processCardRequestedEventUseCase.execute.mock.calls).toHaveLength(3);
    expect(
      cardRequestRepository.registerProcessingAttempt.mock.calls,
    ).toHaveLength(3);
    expect(
      cardRequestRepository.registerProcessingFailure.mock.calls,
    ).toHaveLength(2);
    expect(mockedSleep).toHaveBeenNthCalledWith(1, 1000);
    expect(mockedSleep).toHaveBeenNthCalledWith(2, 2000);
    expect(mockedSleep).toHaveBeenCalledTimes(2);
    expect(cardRequestedDlqEventPublisher.publishDlq.mock.calls).toHaveLength(
      0,
    );
  });

  it('sends the event to DLQ after exhausting the four attempts', async () => {
    processCardRequestedEventUseCase.execute.mockRejectedValue(
      new Error('processor down'),
    );

    const eachMessage = await startConsumerAndGetHandler();

    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(event)),
      },
    });

    expect(processCardRequestedEventUseCase.execute.mock.calls).toHaveLength(4);
    expect(
      cardRequestRepository.registerProcessingAttempt.mock.calls,
    ).toHaveLength(4);
    expect(
      cardRequestRepository.registerProcessingFailure.mock.calls,
    ).toHaveLength(4);
    expect(mockedSleep).toHaveBeenNthCalledWith(1, 1000);
    expect(mockedSleep).toHaveBeenNthCalledWith(2, 2000);
    expect(mockedSleep).toHaveBeenNthCalledWith(3, 4000);
    expect(mockedSleep).toHaveBeenCalledTimes(3);
    expect(
      cardRequestedDlqEventPublisher.publishDlq.mock.calls[0]?.[0],
    ).toEqual({
      reason: 'processor down',
      attempts: 4,
      payload: event.data,
    } satisfies CardRequestedDlqEventData);
    expect(cardRequestRepository.updateStatus.mock.calls[0]).toEqual([
      'request-1',
      'rejected',
      'processor down',
    ]);
  });

  async function startConsumerAndGetHandler(): Promise<EachMessageHandler> {
    await consumer.onModuleInit();

    const runArgs = mockKafkaRun.mock.calls[0]?.[0];

    if (!runArgs) {
      throw new Error('Kafka consumer run handler was not registered');
    }

    return runArgs.eachMessage;
  }
});
