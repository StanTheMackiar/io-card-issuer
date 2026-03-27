export const appConfig = () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    issuerPort: Number(process.env.ISSUER_PORT ?? 3000),
    processorPort: Number(process.env.PROCESSOR_PORT ?? 3001),
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    name: process.env.DB_NAME ?? 'io_card_issuer',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
});
