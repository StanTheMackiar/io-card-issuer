import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CardRequestStatus } from '../enums/card-request-status.enum';
import { CardOrmEntity } from './card-orm.entity';

@Entity({ name: 'card_requests' })
export class CardRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  idempotencyKey: string;

  @Column({ name: 'document_type', type: 'varchar', length: 20 })
  documentType: 'DNI';

  @Column({ name: 'document_number', type: 'varchar', length: 20 })
  documentNumber: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160 })
  fullName: string;

  @Column({ type: 'integer' })
  age: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'product_type', type: 'varchar', length: 50 })
  productType: 'VISA';

  @Column({ type: 'varchar', length: 3 })
  currency: 'PEN' | 'USD';

  @Column({
    type: 'enum',
    enum: CardRequestStatus,
    default: CardRequestStatus.PENDING,
  })
  status: CardRequestStatus;

  @Column({
    name: 'requested_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  requestedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => CardOrmEntity, (card) => card.cardRequest)
  card: CardOrmEntity | null;
}
