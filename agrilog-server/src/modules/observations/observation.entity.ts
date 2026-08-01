import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeverityLevel } from 'agrilog-shared';
import { ActivityEntity } from '../activities/entities/activity.entity';

@Entity({ name: 'observation' })
export class ObservationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({ name: 'symptom', type: 'varchar', length: 200 })
  symptom!: string;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: SeverityLevel,
    default: SeverityLevel.LOW,
  })
  severity!: SeverityLevel;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
