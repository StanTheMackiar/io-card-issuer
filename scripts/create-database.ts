import { Client } from 'pg';
import { getDatabaseConfigFromEnv } from '../libs/shared/src/database/database.config';

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function main() {
  const config = getDatabaseConfigFromEnv();
  const adminClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  await adminClient.connect();

  const result = await adminClient.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS "exists"',
    [config.name],
  );

  if (result.rows[0]?.exists) {
    console.log(`Database "${config.name}" already exists.`);
    await adminClient.end();
    return;
  }

  await adminClient.query(`CREATE DATABASE ${quoteIdentifier(config.name)}`);
  console.log(`Database "${config.name}" created successfully.`);
  await adminClient.end();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to create database: ${message}`);
  process.exitCode = 1;
});
