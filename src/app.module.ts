import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/configuration';
import { envSchema } from './config/env.schema';
import { HealthModule } from './modules/health/health.module';
import { CardsModule } from './modules/cards/cards.module';
import { DatabaseModule } from './shared/infrastructure/database/database.module';

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
    CardsModule,
  ],
})
export class AppModule {}
