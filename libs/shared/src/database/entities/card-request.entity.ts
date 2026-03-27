import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CardRequestStatus } from '../enums/card-request-status.enum';
import { CardEntity } from './card.entity';

@Entity({ name: 'card_requests' })
export class CardRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  idempotencyKey: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 120 })
  customerId: string;

  @Column({ name: 'holder_name', type: 'varchar', length: 160 })
  holderName: string;

  @Column({ type: 'varchar', length: 50 })
  brand: string;

  @Column({ name: 'card_type', type: 'varchar', length: 50 })
  cardType: string;

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

  @OneToOne(() => CardEntity, (card) => card.cardRequest)
  card: CardEntity | null;
}
