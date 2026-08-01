import { IPaginationQuery } from './pagination.dto';

export interface IFarmDto {
  id: number;
  name: string;
  owner_farmer_id?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ICreateFarmDto {
  name: string;
  owner_farmer_id?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface IUpdateFarmDto {
  name?: string;
  owner_farmer_id?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface IFarmSummaryDto extends IFarmDto {
  plot_count?: number;
  total_area?: number;
}

export interface IFarmQueryDto extends IPaginationQuery {
  summary?: string | boolean;
}
