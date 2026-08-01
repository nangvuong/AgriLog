import { IPaginationQuery } from './pagination.dto';

export interface IHarvestDto {
  id: number;
  activity_id: number;
  quantity: number;
  unit?: string;
  quality?: string;
  buyer?: string;
  selling_price?: number;
  created_at: string | Date;
  activity_description?: string;
  season_id?: number;
  season_name?: string;
  farmer_name?: string;
  total_revenue?: number;
}

export interface ICreateHarvestDto {
  activity_id?: number;
  quantity: number;
  unit?: string;
  quality?: string;
  buyer?: string;
  selling_price?: number;
}

export interface IUpdateHarvestDto {
  activity_id?: number;
  quantity?: number;
  unit?: string;
  quality?: string;
  buyer?: string;
  selling_price?: number;
}

export interface IHarvestQueryDto extends IPaginationQuery {
  activityId?: number;
  seasonId?: number;
  quality?: string;
  buyer?: string;
  search?: string;
}
