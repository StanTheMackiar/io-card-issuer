/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from '@app/shared';
import { HealthController } from '../../../libs/shared/src/health/infrastructure/http/health.controller';

describe('AppController (e2e)', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    controller = moduleFixture.get(HealthController);
  });

  it('/api/health (GET)', () => {
    const response = controller.check();

    expect(response.status).toBe('ok');
    expect(typeof response.timestamp).toBe('string');
  });
});
