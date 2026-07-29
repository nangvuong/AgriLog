import { TrangThaiLoBuoi } from '../enums/batch-status.enum';
import { TieuChuanKiemDinh } from '../enums/standard.enum';

/**
 * Interface DTO tạo lô bưởi canh tác & xuất khẩu mới
 */
export interface ICreatePomeloBatchDto {
  ma_lo: string;
  vung_trong_id: number;
  dien_tich_m2: number;
  giong_buoi: string;
  tieu_chuan?: TieuChuanKiemDinh;
  ngay_bat_dau_canh_tac: string | Date;
}
export type CreatePomeloBatchDto = ICreatePomeloBatchDto;

/**
 * Interface DTO thông tin chi tiết lô bưởi
 */
export interface IPomeloBatchDto {
  id: number;
  ma_lo: string;
  vung_trong_id: number;
  dien_tich_m2: number;
  giong_buoi: string;
  tieu_chuan: TieuChuanKiemDinh;
  trang_thai: TrangThaiLoBuoi;
  ngay_bat_dau_canh_tac: string | Date;
  ngay_du_kien_thu_hoach?: string | Date;
  qr_code_url?: string;
}
export type PomeloBatchDto = IPomeloBatchDto;
