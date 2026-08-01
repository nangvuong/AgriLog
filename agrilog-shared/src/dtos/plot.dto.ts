import { PlotStatus } from '../enums/plot.enum';

export interface IPlotGeoJson {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface IPlotDto {
  id: number;
  farm_id: number;
  code: string;
  name?: string;
  area: number;
  soil_type?: string;
  status: PlotStatus;
  polygon?: IPlotGeoJson | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ICreatePlotDto {
  farm_id: number;
  code: string;
  name?: string;
  area: number;
  soil_type?: string;
  status?: PlotStatus;
  polygon?: IPlotGeoJson | null;
}

export interface IUpdatePlotDto {
  code?: string;
  name?: string;
  area?: number;
  soil_type?: string;
  status?: PlotStatus;
  polygon?: IPlotGeoJson | null;
}
