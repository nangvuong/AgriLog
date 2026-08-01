import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { AssetEntity } from '../../assets/asset.entity';

@Entity({ name: 'activity_asset' })
export class ActivityAssetEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'activity_id', type: 'bigint' })
  activity_id!: number;

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity;

  @Column({ name: 'asset_id', type: 'bigint' })
  asset_id!: number;

  @ManyToOne(() => AssetEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'asset_id' })
  asset?: AssetEntity;

  @Column({ name: 'usage_duration', type: 'integer', nullable: true })
  usage_duration?: number;
}
