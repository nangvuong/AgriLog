export interface IMaterialDto {
  id: number;
  name: string;
  category?: string;
  manufacturer?: string;
  default_unit?: string;
  description?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ICreateMaterialDto {
  name: string;
  category?: string;
  manufacturer?: string;
  default_unit?: string;
  description?: string;
}

export interface IUpdateMaterialDto {
  name?: string;
  category?: string;
  manufacturer?: string;
  default_unit?: string;
  description?: string;
}
