import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCardsTable1774584404302 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'card_request_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'processor_card_reference',
            type: 'varchar',
            length: '120',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'last_four',
            type: 'char',
            length: '4',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['created', 'active', 'blocked', 'cancelled'],
            enumName: 'cards_status_enum',
            default: "'created'",
          },
          {
            name: 'issued_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
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

    await queryRunner.createForeignKey(
      'cards',
      new TableForeignKey({
        name: 'FK_cards_card_request_id',
        columnNames: ['card_request_id'],
        referencedTableName: 'card_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'cards',
      new TableIndex({
        name: 'IDX_cards_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('cards', 'IDX_cards_status');
    await queryRunner.dropForeignKey('cards', 'FK_cards_card_request_id');
    await queryRunner.dropTable('cards');
  }
}
