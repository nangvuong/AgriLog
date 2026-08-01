import type {
  FarmerAlertLevel,
  FarmerAlertTag,
  LoaiHoatDongCanhTac,
} from '../enums/index.js';

/**
 * Interface cảnh báo canh tác & cách ly GlobalGAP trên trang chủ nông dân (.alert-card)
 */
export interface IFarmerAlertDto {
  id: number;
  tag: FarmerAlertTag | string;
  level: FarmerAlertLevel | 'danger' | 'warning' | 'info';
  message: string;
  lo_id?: number;
  vu_mua_id?: number;
}
export type FarmerAlertDto = IFarmerAlertDto;

/**
 * Interface vụ mùa đang canh tác hiển thị trên thẻ card (.season-card)
 */
export interface IFarmerSeasonDto {
  id: number;
  ten_lo: string;
  giong_buoi?: string;
  meta: string;
  tien_do_phan_tram: number;
  so_cay: number;
  trang_thai_tag: string;
  is_urgent?: boolean;
}
export type FarmerSeasonDto = IFarmerSeasonDto;

/**
 * Interface hoạt động canh tác gần đây (.activity-item)
 */
export interface IFarmerRecentActivityDto {
  id: number;
  title: string;
  time_ago: string;
  icon_type: LoaiHoatDongCanhTac | string;
  loai_hoat_dong: LoaiHoatDongCanhTac | string;
  ngay_thuc_hien: string;
}
export type FarmerRecentActivityDto = IFarmerRecentActivityDto;

/**
 * Interface DTO tổng hợp toàn bộ dữ liệu trang chủ nông dân (trang-chu-nong-dan.html)
 */
export interface IFarmerDashboardResponse {
  greeting: string;
  current_date: string;
  weather: string;
  unread_alerts_count: number;
  alerts: IFarmerAlertDto[];
  seasons: IFarmerSeasonDto[];
  recent_activities: IFarmerRecentActivityDto[];
}
export type FarmerDashboardResponse = IFarmerDashboardResponse;

/**
 * Interface thông tin vật tư thuộc 1 hoạt động canh tác
 */
export interface IVatTuItemDto {
  ten_vat_tu: string;
  lieu_luong: string;
  loai_vat_tu?: string;
}
export type VatTuItemDto = IVatTuItemDto;

/**
 * Interface 1 hoạt động canh tác chứa danh sách 1 hoặc nhiều vật tư
 */
export interface IHoatDongItemDto {
  loai_hoat_dong: LoaiHoatDongCanhTac | string;
  mo_ta?: string;
  vat_tu_list?: IVatTuItemDto[];
}
export type HoatDongItemDto = IHoatDongItemDto;

/**
 * Interface chuẩn Request Schema cho API Ghi nhật ký nhanh
 */
export interface IQuickFarmingLogDto {
  vu_mua_id: number;
  hoat_dong_list: IHoatDongItemDto[];
  loai_hoat_dong?: LoaiHoatDongCanhTac | string;
  vi_tri_gps?: string;
  ngay_thuc_hien?: string;
  mo_ta?: string;
  hinh_anh?: string[];
}
export type QuickFarmingLogDto = IQuickFarmingLogDto;

/**
 * Interface DTO vị trí GPS gửi lên API tính vị trí
 */
export interface IGetNearestPlotQueryDto {
  lat: number;
  lng: number;
}
export type GetNearestPlotQueryDto = IGetNearestPlotQueryDto;

/**
 * API 1: Interface DTO kết quả Lô gần nhất từ tọa độ GPS
 */
export interface INearestPlotDto {
  id: number;
  ma_lo: string;
  ten_lo: string;
  giong_buoi: string;
  distance_meters: number;
  distance_text: string;
  toa_do_gps: {
    lat: number;
    lng: number;
  };
  vu_mua_id?: number;
  message?: string;
}
export type NearestPlotDto = INearestPlotDto;

/**
 * API 2: Interface DTO kết quả giải mã địa chỉ hành chính từ tọa độ GPS (Reverse Geocoding)
 */
export interface IReverseGeocodeDto {
  lat: number;
  lng: number;
  formatted_address: string;
  tinh_thanh?: string;
  quan_huyen?: string;
  phuong_xa?: string;
  ten_vung_trong?: string;
}
export type ReverseGeocodeDto = IReverseGeocodeDto;
