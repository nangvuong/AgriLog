import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CropVarietyEntity } from '../crop-varieties/crop-variety.entity';

@Entity({ name: 'crop' })
export class CropEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'scientific_name', type: 'varchar', length: 150, nullable: true })
  scientific_name?: string;

  @Column({ name: 'category', type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => CropVarietyEntity, (variety) => variety.crop)
  varieties?: CropVarietyEntity[];
}
