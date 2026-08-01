import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetStatus } from 'agrilog-shared';
import { FarmEntity } from '../farms/farm.entity';

@Entity({ name: 'asset' })
export class AssetEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'farm_id', type: 'bigint' })
  farm_id!: number;

  @ManyToOne(() => FarmEntity, (farm) => farm.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id' })
  farm?: FarmEntity;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: true })
  type?: string;

  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serial_number?: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchase_date?: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status!: AssetStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
