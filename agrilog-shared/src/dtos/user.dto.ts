import { VaiTroNguoiDung } from '../enums/user-role.enum.js';
import type { IUserProfile } from './auth.dto.js';

/**
 * Interface cho DTO Cập nhật thông tin người dùng
 */
export interface IUpdateUserDto {
  ho_ten?: string;
  so_dien_thoai?: string;
  email?: string;
  vai_tro?: VaiTroNguoiDung;
  vung_trong_id?: number;
  trang_thai?: boolean;
}
export type UpdateUserDto = IUpdateUserDto;

/**
 * Interface cho DTO Lọc & tìm kiếm danh sách người dùng
 */
export interface IUserQueryDto {
  search?: string;
  vai_tro?: VaiTroNguoiDung;
  vung_trong_id?: number;
  trang_thai?: boolean;
  page?: number;
  limit?: number;
}
export type UserQueryDto = IUserQueryDto;

/**
 * Interface kết quả danh sách người dùng phân trang
 */
export interface IUserListResponse {
  data: IUserProfile[];
  total: number;
  page: number;
  limit: number;
}
export type UserListResponse = IUserListResponse;
