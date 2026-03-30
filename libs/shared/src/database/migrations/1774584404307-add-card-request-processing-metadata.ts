import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCardRequestProcessingMetadata1774584404307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('card_requests', [
      new TableColumn({
        name: 'processing_attempts',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
      new TableColumn({
        name: 'last_processing_error',
        type: 'text',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('card_requests', 'last_processing_error');
    await queryRunner.dropColumn('card_requests', 'processing_attempts');
  }
}
