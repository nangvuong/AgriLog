import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'material' })
export class MaterialEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'category', type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ name: 'manufacturer', type: 'varchar', length: 100, nullable: true })
  manufacturer?: string;

  @Column({ name: 'default_unit', type: 'varchar', length: 20, nullable: true })
  default_unit?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
