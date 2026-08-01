import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'activity_type' })
export class ActivityTypeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}
