import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { MaterialEntity } from '../../materials/material.entity';

@Entity({ name: 'activity_material' })
export class ActivityMaterialEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({ name: 'material_id', type: 'bigint' })
  material_id!: number;

  @ManyToOne(() => MaterialEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'material_id' })
  material?: MaterialEntity;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ name: 'unit', type: 'varchar', length: 20, nullable: true })
  unit?: string;
}
