import { apiClient } from './axios.client';

export interface ActivityType {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface ActivityMaterialPayload {
  material_name: string;
  quantity: string;
  unit?: string;
}

export interface ActivityAssetPayload {
  asset_name: string;
  usage_duration: string;
  asset_type?: string;
}

export interface ActivityObservationPayload {
  symptom: string;
  severity: string;
  description?: string;
}

export interface ActivityHarvestPayload {
  quantity: string;
  unit?: string;
  quality?: string;
  buyer?: string;
  selling_price?: string;
}

export interface CreateActivityPayload {
  source_type: string;
  plot_code?: string;
  activity_type_code: string;
  start_time: string;
  end_time?: string;
  description: string;
  note?: string;
  materials?: ActivityMaterialPayload[];
  assets?: ActivityAssetPayload[];
  observations?: ActivityObservationPayload[];
  harvests?: ActivityHarvestPayload[];
}

export const activitiesService = {
  /**
   * Lấy danh sách loại hoạt động canh tác
   */
  async getActivityTypes(): Promise<ActivityType[]> {
    const response = await apiClient.get('/activity-types');
    return response.data;
  },

  /**
   * Tạo 1 hoặc nhiều nhật ký hoạt động canh tác cùng lúc
   */
  async createActivity(
    data: CreateActivityPayload | CreateActivityPayload[],
  ): Promise<any> {
    const response = await apiClient.post('/activities', data);
    return response.data;
  },

  /**
   * Tạo danh sách nhiều nhật ký hoạt động canh tác cùng lúc (bulk create)
   */
  async createActivitiesBulk(
    data: CreateActivityPayload[],
  ): Promise<any> {
    const response = await apiClient.post('/activities/bulk', data);
    return response.data;
  },
};
