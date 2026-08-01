import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FarmEntity } from '../farms/farm.entity';
import { MaterialEntity } from '../materials/material.entity';

@Entity({ name: 'inventory' })
export class InventoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'farm_id', type: 'bigint' })
  farm_id!: number;

  @ManyToOne(() => FarmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm?: FarmEntity;

  @Column({ name: 'material_id', type: 'bigint' })
  material_id!: number;

  @ManyToOne(() => MaterialEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'material_id' })
  material?: MaterialEntity;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  quantity!: number;

  @Column({ name: 'unit', type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
