import { apiClient } from './axios.client';

export interface ExtractedActivityMaterial {
  ten_vat_tu: string;
  loai_vat_tu?: string;
  lieu_luong?: number;
  don_vi?: string;
}

export interface ExtractedActivityAsset {
  ten_tai_san: string;
  loai_tai_san?: string;
  thoi_gian_su_dung?: number;
}

export interface ExtractedActivityObservation {
  ten_sau_benh: string;
  muc_do?: string;
  trieu_chung?: string;
  hinh_anh?: string | null;
}

export interface ExtractedActivityHarvest {
  san_luong_thu_hoach?: number;
  don_vi_thu_hoach?: string;
  pham_cap?: string;
  thuong_lai?: string;
  gia_ban?: number;
}

export interface ExtractedActivityItem {
  loai_hoat_dong: string;
  ngay_thuc_hien?: string;
  mo_ta?: string;
  thoi_tiet?: string | null;
  ma_lo?: string;
  cay_trong?: string;
  materials?: ExtractedActivityMaterial[];
  assets?: ExtractedActivityAsset[];
  observations?: ExtractedActivityObservation[];
  harvests?: ExtractedActivityHarvest[];
}

export interface STTResponse {
  status: 'success' | 'error';
  raw_text: string;
  input?: string;
  output?: ExtractedActivityItem[];
  activities?: ExtractedActivityItem[];
  parsed_data?: ExtractedActivityItem[];
  model?: string;
  model_name?: string;
  processing_time_ms?: number;
  error?: string;
}

export function getExtractedActivities(res: any): ExtractedActivityItem[] {
  if (!res) return [];
  if (Array.isArray(res.activities)) return res.activities;
  if (Array.isArray(res.output)) return res.output;
  if (Array.isArray(res.parsed_data)) return res.parsed_data;
  return [];
}

export const aiExtractionService = {
  async extractFromText(text: string): Promise<STTResponse> {
    const response = await apiClient.post<STTResponse>(
      '/activities/extract/text',
      {
        text,
      },
    );
    return response.data;
  },

  async extractFromVoice(
    fileBlob: Blob,
    filename = 'recording.webm',
  ): Promise<STTResponse> {
    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    formData.append('process_llm', 'true');

    const response = await apiClient.post<STTResponse>(
      '/activities/extract/voice',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async extractFromVideo(
    fileBlob: Blob,
    filename = 'video.webm',
    description?: string,
  ): Promise<STTResponse> {
    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post<STTResponse>(
      '/activities/extract/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
