import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Entity({ name: 'harvest' })
export class HarvestEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity!: number;

  @Column({ name: 'unit', type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ name: 'quality', type: 'varchar', length: 50, nullable: true })
  quality?: string;

  @Column({ name: 'buyer', type: 'varchar', length: 150, nullable: true })
  buyer?: string;

  @Column({
    name: 'selling_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  selling_price?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
