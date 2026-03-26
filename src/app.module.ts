import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { CardsModule } from './modules/cards/cards.module';

@Module({
  imports: [HealthModule, CardsModule],
})
export class AppModule {}
