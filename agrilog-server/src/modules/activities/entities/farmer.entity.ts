import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'farmer' })
export class FarmerEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  full_name!: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true })
  email?: string;
}
