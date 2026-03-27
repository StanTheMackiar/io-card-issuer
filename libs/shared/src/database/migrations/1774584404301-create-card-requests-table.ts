import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCardRequestsTable1774584404301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'card_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'idempotency_key',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'document_type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'document_number',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '160',
            isNullable: false,
          },
          {
            name: 'age',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'product_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'issued'],
            enumName: 'card_requests_status_enum',
            default: "'pending'",
          },
          {
            name: 'requested_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'processed_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'card_requests',
      new TableIndex({
        name: 'IDX_card_requests_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('card_requests', 'IDX_card_requests_status');
    await queryRunner.dropTable('card_requests');
  }
}
