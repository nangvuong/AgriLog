import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AiStatus, SourceType } from 'agrilog-shared';
import { SeasonEntity } from '../../seasons/season.entity';
import { FarmerEntity } from './farmer.entity';
import { ActivityTypeEntity } from './activity-type.entity';

@Entity({ name: 'activity' })
export class ActivityEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'season_id', type: 'bigint' })
  season_id!: number;

  @ManyToOne(() => SeasonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season?: SeasonEntity;

  @Column({ name: 'farmer_id', type: 'bigint' })
  farmer_id!: number;

  @ManyToOne(() => FarmerEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'farmer_id' })
  farmer?: FarmerEntity;

  @Column({ name: 'activity_type_id', type: 'bigint' })
  activity_type_id!: number;

  @ManyToOne(() => ActivityTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'activity_type_id' })
  activity_type?: ActivityTypeEntity;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  start_time!: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  end_time?: Date | null;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: SourceType,
    default: SourceType.MANUAL,
  })
  source_type!: SourceType;

  @Column({
    name: 'ai_status',
    type: 'enum',
    enum: AiStatus,
    nullable: true,
  })
  ai_status?: AiStatus | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
