import { IPaginationQuery } from './pagination.dto';

export interface IInventoryDto {
  id: number;
  farm_id: number;
  material_id: number;
  quantity: number;
  unit?: string;
  updated_at: string | Date;
  farm_name?: string;
  material_name?: string;
  material_category?: string;
  material_default_unit?: string;
}

export interface ICreateInventoryDto {
  farm_id: number;
  material_id: number;
  quantity: number;
  unit?: string;
}

export interface IUpdateInventoryDto {
  quantity?: number;
  unit?: string;
}

export interface IInventoryQueryDto extends IPaginationQuery {
  farmId?: number;
  materialId?: number;
}
