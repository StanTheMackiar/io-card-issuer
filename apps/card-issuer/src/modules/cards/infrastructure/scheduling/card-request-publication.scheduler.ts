import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PublishPendingCardRequestEventsUseCase } from '../../application/use-cases/publish-pending-card-request-events.use-case';

@Injectable()
export class CardRequestPublicationScheduler {
  private readonly logger = new Logger(CardRequestPublicationScheduler.name);
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly publishPendingCardRequestEventsUseCase: PublishPendingCardRequestEventsUseCase,
  ) {}

  @Cron('*/10 * * * * *', {
    name: 'card-request-publication',
  })
  async handlePendingPublications(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const batchSize = this.configService.getOrThrow<number>(
        'kafka.cardRequestRetryBatchSize',
      );
      const result =
        await this.publishPendingCardRequestEventsUseCase.execute(batchSize);

      if (result.pendingCount === 0) {
        return;
      }

      this.logger.log(
        `Card request publication tick processed ${result.pendingCount} pending requests: ${result.publishedCount} published, ${result.failedCount} failed`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Card request publication scheduler failed: ${errorMessage}`,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
