import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { CardEntity, CardRequestEntity } from './entities';

export type DatabaseConfig = {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  synchronize: boolean;
};

export function getDatabaseConfigFromEnv(): DatabaseConfig {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    name: process.env.DB_NAME ?? 'io_card_issuer',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  };
}

export function buildDatabaseOptions(
  config: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    database: config.name,
    username: config.user,
    password: config.password,
    synchronize: config.synchronize,
    entities: [CardRequestEntity, CardEntity],
    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
  };
}
