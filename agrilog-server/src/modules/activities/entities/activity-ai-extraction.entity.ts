import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';

@Entity({ name: 'activity_ai_extraction' })
export class ActivityAiExtractionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({ name: 'model_name', type: 'varchar', length: 100 })
  model_name!: string;

  @Column({ name: 'prompt_version', type: 'varchar', length: 50, nullable: true })
  prompt_version?: string;

  @Column({ name: 'input_text', type: 'text', nullable: true })
  input_text?: string;

  @Column({ name: 'output_json', type: 'jsonb', nullable: true })
  output_json?: any;

  @Column({ name: 'confidence', type: 'decimal', precision: 4, scale: 3, nullable: true })
  confidence?: number;

  @Column({ name: 'processing_time_ms', type: 'int', nullable: true })
  processing_time_ms?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
