import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SeasonStatus } from 'agrilog-shared';
import { PlotEntity } from '../plots/plot.entity';
import { CropVarietyEntity } from '../crop-varieties/crop-variety.entity';

@Entity({ name: 'season' })
export class SeasonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'plot_id', type: 'bigint' })
  plot_id!: number;

  @ManyToOne(() => PlotEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plot_id' })
  plot?: PlotEntity;

  @Column({ name: 'crop_variety_id', type: 'bigint' })
  crop_variety_id!: number;

  @ManyToOne(() => CropVarietyEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'crop_variety_id' })
  crop_variety?: CropVarietyEntity;

  @Column({ name: 'planting_date', type: 'date' })
  planting_date!: Date;

  @Column({ name: 'expected_harvest_date', type: 'date', nullable: true })
  expected_harvest_date?: Date | null;

  @Column({ name: 'actual_harvest_date', type: 'date', nullable: true })
  actual_harvest_date?: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SeasonStatus,
    default: SeasonStatus.PLANNED,
  })
  status!: SeasonStatus;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
