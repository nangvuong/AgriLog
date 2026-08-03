import { SourceType, AiStatus } from '../enums/activity.enum';
import { IPaginationQuery } from './pagination.dto';
import { IObservationDto, ICreateObservationDto } from './observation.dto';
import { IHarvestDto, ICreateHarvestDto } from './harvest.dto';

export interface IActivityTypeDto {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface ICreateActivityTypeDto {
  code: string;
  name: string;
  description?: string;
}

export interface IUpdateActivityTypeDto {
  code?: string;
  name?: string;
  description?: string;
}

export interface IActivityMaterialDto {
  id: number;
  activity_id: number;
  material_id: number;
  quantity: number;
  unit?: string;
  material_name?: string;
  material_default_unit?: string;
}

export interface ICreateActivityMaterialDto {
  material_id: number;
  quantity: number;
  unit?: string;
}

export interface IActivityAssetDto {
  id: number;
  activity_id: number;
  asset_id: number;
  usage_duration?: number;
  asset_name?: string;
  asset_type?: string;
}

export interface ICreateActivityAssetDto {
  asset_id: number;
  usage_duration?: number;
}

export interface ICreateActivityAiExtractionDto {
  model_name: string;
  model?: string;
  prompt_version?: string;
  input_text?: string;
  input?: string;
  output_json?: any;
  output?: any;
  confidence?: number;
  processing_time_ms?: number;
  processing_time?: number;
}

export interface IActivityAiExtractionDto {
  id: number;
  activity_id: number;
  model_name: string;
  prompt_version?: string;
  input_text?: string;
  output_json?: any;
  confidence?: number;
  processing_time_ms?: number;
  created_at: string | Date;
}

export interface IActivityDto {
  id: number;
  season_id: number;
  farmer_id: number;
  activity_type_id: number;
  description?: string;
  note?: string;
  start_time: string | Date;
  end_time?: string | Date | null;
  latitude?: number;
  longitude?: number;
  source_type: SourceType;
  ai_status?: AiStatus | null;
  created_at: string | Date;
  updated_at: string | Date;
  season_name?: string;
  farmer_name?: string;
  activity_type_code?: string;
  activity_type_name?: string;
  materials?: IActivityMaterialDto[];
  assets?: IActivityAssetDto[];
  observations?: IObservationDto[];
  harvests?: IHarvestDto[];
  ai_extraction?: IActivityAiExtractionDto;
}

export interface ICreateActivityDto {
  season_id: number;
  farmer_id: number;
  activity_type_id: number;
  description?: string;
  note?: string;
  start_time: string | Date;
  end_time?: string | Date;
  latitude?: number;
  longitude?: number;
  source_type?: SourceType;
  ai_status?: AiStatus;
  materials?: ICreateActivityMaterialDto[];
  assets?: ICreateActivityAssetDto[];
  observations?: ICreateObservationDto[];
  harvests?: ICreateHarvestDto[];
  ai_extraction?: ICreateActivityAiExtractionDto;
}

export interface IUpdateActivityDto {
  season_id?: number;
  farmer_id?: number;
  activity_type_id?: number;
  description?: string;
  note?: string;
  start_time?: string | Date;
  end_time?: string | Date;
  latitude?: number;
  longitude?: number;
  source_type?: SourceType;
  ai_status?: AiStatus;
  materials?: ICreateActivityMaterialDto[];
  assets?: ICreateActivityAssetDto[];
  observations?: ICreateObservationDto[];
  harvests?: ICreateHarvestDto[];
}

export interface IActivityQueryDto extends IPaginationQuery {
  seasonId?: number;
  farmerId?: number;
  activityTypeId?: number;
  sourceType?: SourceType;
  aiStatus?: AiStatus;
}
