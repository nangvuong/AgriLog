import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediaType } from 'agrilog-shared';
import { ActivityEntity } from './activity.entity';

@Entity({ name: 'activity_media' })
export class ActivityMediaEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, (activity) => activity.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: MediaType,
  })
  media_type!: MediaType;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  file_name?: string;

  @Column({ name: 'file_url', type: 'text' })
  file_url!: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnail_url?: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mime_type?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size?: number;

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
