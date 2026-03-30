import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCardSensitiveFields1774584404306 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('cards', [
      new TableColumn({
        name: 'card_number',
        type: 'varchar',
        length: '16',
        isNullable: false,
        isUnique: true,
      }),
      new TableColumn({
        name: 'expiration_date',
        type: 'char',
        length: '5',
        isNullable: false,
      }),
      new TableColumn({
        name: 'cvv',
        type: 'char',
        length: '3',
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cards', 'cvv');
    await queryRunner.dropColumn('cards', 'expiration_date');
    await queryRunner.dropColumn('cards', 'card_number');
  }
}
