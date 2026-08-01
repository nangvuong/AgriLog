import { SeasonStatus } from '../enums/season.enum';
import { IPaginationQuery } from './pagination.dto';

export interface ISeasonDto {
  id: number;
  plot_id: number;
  crop_variety_id: number;
  planting_date: string | Date;
  expected_harvest_date?: string | Date | null;
  actual_harvest_date?: string | Date | null;
  status: SeasonStatus;
  note?: string;
  created_at: string | Date;
  updated_at: string | Date;
  plot_code?: string;
  plot_name?: string;
  crop_name?: string;
  crop_variety_name?: string;
}

export interface ICreateSeasonDto {
  plot_id: number;
  crop_variety_id: number;
  planting_date: string | Date;
  expected_harvest_date?: string | Date;
  actual_harvest_date?: string | Date;
  status?: SeasonStatus;
  note?: string;
}

export interface IUpdateSeasonDto {
  planting_date?: string | Date;
  expected_harvest_date?: string | Date | null;
  actual_harvest_date?: string | Date | null;
  status?: SeasonStatus;
  note?: string;
}

export interface ISeasonFilterQuery extends IPaginationQuery {
  plotId?: number;
  cropVarietyId?: number;
  status?: SeasonStatus;
}
