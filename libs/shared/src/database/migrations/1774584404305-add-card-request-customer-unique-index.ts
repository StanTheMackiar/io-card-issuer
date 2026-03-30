import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddCardRequestCustomerUniqueIndex1774584404305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'card_requests',
      new TableIndex({
        name: 'UQ_card_requests_customer_document',
        columnNames: ['document_type', 'document_number'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'card_requests',
      'UQ_card_requests_customer_document',
    );
  }
}
