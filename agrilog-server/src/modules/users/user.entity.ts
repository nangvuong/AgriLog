import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, UserStatus } from 'agrilog-shared';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true, nullable: true })
  email?: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.FARMER,
  })
  role!: UserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  last_login?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
