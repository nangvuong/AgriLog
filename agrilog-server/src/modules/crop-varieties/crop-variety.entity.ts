import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CropEntity } from '../crops/crop.entity';

@Entity({ name: 'crop_variety' })
@Unique(['crop_id', 'name'])
export class CropVarietyEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'crop_id', type: 'bigint' })
  crop_id!: number;

  @ManyToOne(() => CropEntity, (crop) => crop.varieties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crop_id' })
  crop?: CropEntity;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'supplier', type: 'varchar', length: 100, nullable: true })
  supplier?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}
