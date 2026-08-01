import { AssetStatus } from '../enums/asset.enum';
import { IPaginationQuery } from './pagination.dto';

export interface IAssetDto {
  id: number;
  farm_id: number;
  name: string;
  type?: string;
  serial_number?: string;
  purchase_date?: string | Date | null;
  status: AssetStatus;
  created_at: string | Date;
  updated_at: string | Date;
  farm_name?: string;
}

export interface ICreateAssetDto {
  farm_id: number;
  name: string;
  type?: string;
  serial_number?: string;
  purchase_date?: string | Date;
  status?: AssetStatus;
}

export interface IUpdateAssetDto {
  name?: string;
  type?: string;
  serial_number?: string;
  purchase_date?: string | Date;
  status?: AssetStatus;
}

export interface IAssetQueryDto extends IPaginationQuery {
  farmId?: number;
  status?: AssetStatus;
}
