import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCardRequestEventForceError1774584404304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'card_requests',
      new TableColumn({
        name: 'event_force_error',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('card_requests', 'event_force_error');
  }
}
