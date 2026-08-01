export interface ICropVarietyDto {
  id: number;
  crop_id: number;
  name: string;
  supplier?: string;
  description?: string;
  crop_name?: string;
}

export interface ICreateCropVarietyDto {
  crop_id: number;
  name: string;
  supplier?: string;
  description?: string;
}

export interface IUpdateCropVarietyDto {
  name?: string;
  supplier?: string;
  description?: string;
}
