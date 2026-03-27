import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CardStatus } from '../enums/card-status.enum';
import { CardRequestEntity } from './card-request.entity';

@Entity({ name: 'cards' })
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'card_request_id', type: 'uuid', unique: true })
  cardRequestId: string;

  @OneToOne(() => CardRequestEntity, (cardRequest) => cardRequest.card, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_request_id' })
  cardRequest: CardRequestEntity;

  @Column({
    name: 'processor_card_reference',
    type: 'varchar',
    length: 120,
    unique: true,
  })
  processorCardReference: string;

  @Column({ name: 'last_four', type: 'char', length: 4 })
  lastFour: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.CREATED,
  })
  status: CardStatus;

  @Column({
    name: 'issued_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  issuedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
