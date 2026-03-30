export const TRANSACTION_MANAGER = 'TRANSACTION_MANAGER';

export interface TransactionManagerPort {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
