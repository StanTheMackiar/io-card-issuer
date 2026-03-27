import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseOptions } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildDatabaseOptions({
          host: configService.getOrThrow<string>('database.host'),
          port: configService.getOrThrow<number>('database.port'),
          name: configService.getOrThrow<string>('database.name'),
          user: configService.getOrThrow<string>('database.user'),
          password: configService.getOrThrow<string>('database.password'),
          synchronize: configService.getOrThrow<boolean>(
            'database.synchronize',
          ),
        }),
    }),
  ],
})
export class DatabaseModule {}
