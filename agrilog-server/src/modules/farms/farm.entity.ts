import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlotEntity } from '../plots/plot.entity';
import { AssetEntity } from '../assets/asset.entity';

@Entity({ name: 'farm' })
export class FarmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'owner_farmer_id', type: 'bigint', nullable: true })
  owner_farmer_id?: number | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number) => value,
      from: (value?: string) => (value ? parseFloat(value) : undefined),
    },
  })
  latitude?: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number) => value,
      from: (value?: string) => (value ? parseFloat(value) : undefined),
    },
  })
  longitude?: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => PlotEntity, (plot) => plot.farm)
  plots?: PlotEntity[];

  @OneToMany(() => AssetEntity, (asset) => asset.farm)
  assets?: AssetEntity[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
