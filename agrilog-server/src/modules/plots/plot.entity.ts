import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PlotStatus, IPlotGeoJson } from 'agrilog-shared';
import { FarmEntity } from '../farms/farm.entity';

@Entity({ name: 'plot' })
@Unique(['farm_id', 'code'])
export class PlotEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'farm_id', type: 'bigint' })
  farm_id!: number;

  @ManyToOne(() => FarmEntity, (farm) => farm.plots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id' })
  farm?: FarmEntity;

  @Column({ name: 'code', type: 'varchar', length: 30 })
  code!: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({
    name: 'area',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value?: string) => (value ? parseFloat(value) : 0),
    },
  })
  area!: number;

  @Column({
    name: 'polygon',
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  polygon?: IPlotGeoJson | null;

  @Column({ name: 'soil_type', type: 'varchar', length: 50, nullable: true })
  soil_type?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PlotStatus,
    default: PlotStatus.ACTIVE,
  })
  status!: PlotStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
