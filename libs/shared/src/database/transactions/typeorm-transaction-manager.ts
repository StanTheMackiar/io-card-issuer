import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmTransactionContext } from './typeorm-transaction-context';

@Injectable()
export class TypeOrmTransactionManager {
  constructor(
    private readonly dataSource: DataSource,
    private readonly transactionContext: TypeOrmTransactionContext,
  ) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      this.transactionContext.run(manager, work),
    );
  }
}
