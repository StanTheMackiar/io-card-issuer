import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCardRequestPublicationMetadata1774584404303 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('card_requests', [
      new TableColumn({
        name: 'event_published_at',
        type: 'timestamptz',
        isNullable: true,
      }),
      new TableColumn({
        name: 'event_publish_attempts',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
      new TableColumn({
        name: 'last_publish_error',
        type: 'text',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('card_requests', 'last_publish_error');
    await queryRunner.dropColumn('card_requests', 'event_publish_attempts');
    await queryRunner.dropColumn('card_requests', 'event_published_at');
  }
}
