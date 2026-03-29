import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import {
  appConfig,
  DatabaseModule,
  envSchema,
  HealthModule,
} from '@app/shared';
import { CardsModule } from './modules/cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    ScheduleModule.forRoot(),
    CardsModule,
  ],
})
export class AppModule {}
