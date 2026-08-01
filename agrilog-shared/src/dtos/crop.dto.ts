export interface ICropDto {
  id: number;
  name: string;
  scientific_name?: string;
  category?: string;
  description?: string;
}

export interface ICreateCropDto {
  name: string;
  scientific_name?: string;
  category?: string;
  description?: string;
}

export interface IUpdateCropDto {
  name?: string;
  scientific_name?: string;
  category?: string;
  description?: string;
}

export interface ICropSummaryDto extends ICropDto {
  variety_count?: number;
}
