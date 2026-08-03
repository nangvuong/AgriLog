import { SeverityLevel } from '../enums/activity.enum';
import { IPaginationQuery } from './pagination.dto';

export interface IObservationDto {
  id: number;
  activity_id: number;
  symptom: string;
  severity: SeverityLevel;
  description?: string;
  created_at: string | Date;
  activity_description?: string;
  season_name?: string;
  farmer_name?: string;
}

export interface ICreateObservationDto {
  activity_id?: number;
  symptom: string;
  severity?: SeverityLevel;
  description?: string;
}

export interface IUpdateObservationDto {
  activity_id?: number;
  symptom?: string;
  severity?: SeverityLevel;
  description?: string;
}

export interface IObservationQueryDto extends IPaginationQuery {
  activityId?: number;
  seasonId?: number;
  severity?: SeverityLevel;
  search?: string;
}
