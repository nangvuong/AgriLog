import { LoaiHoatDongCanhTac } from '../enums/activity-type.enum.js';

/**
 * Interface DTO tạo nhật ký canh tác điện tử cho lô bưởi
 */
export interface ICreateFarmingLogDto {
  lo_buoi_id: number;
  loai_hoat_dong: LoaiHoatDongCanhTac;
  ngay_thuc_hien: string | Date;
  noi_dung_cong_viec: string;
  ten_vat_tu_suy_dung?: string;
  lieu_luong?: string;
  hinh_anh_minh_hoa?: string[];
  ghi_chu?: string;
}
export type CreateFarmingLogDto = ICreateFarmingLogDto;

/**
 * Interface DTO chi tiết bản ghi nhật ký canh tác bưởi
 */
export interface IFarmingLogDto {
  id: number;
  lo_buoi_id: number;
  nguoi_thuc_hien_id: number;
  ten_nguoi_thuc_hien?: string;
  loai_hoat_dong: LoaiHoatDongCanhTac;
  ngay_thuc_hien: string | Date;
  noi_dung_cong_viec: string;
  ten_vat_tu_suy_dung?: string;
  lieu_luong?: string;
  hinh_anh_minh_hoa?: string[];
  ghi_chu?: string;
  ngay_tao: string | Date;
}
export type FarmingLogDto = IFarmingLogDto;
