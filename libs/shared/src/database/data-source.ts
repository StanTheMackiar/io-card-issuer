import { DataSource } from 'typeorm';
import {
  buildDatabaseOptions,
  getDatabaseConfigFromEnv,
} from './database.config';

export default new DataSource(buildDatabaseOptions(getDatabaseConfigFromEnv()));
