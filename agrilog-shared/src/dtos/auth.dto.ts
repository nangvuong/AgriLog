import { VaiTroNguoiDung } from '../enums/user-role.enum';

/**
 * Interface cho DTO Đăng nhập hệ thống
 */
export interface ILoginDto {
  so_dien_thoai_hoac_email: string;
  mat_khau: string;
}
export type LoginDto = ILoginDto;

/**
 * Interface cho DTO Đăng ký tài khoản mới trong chuỗi xuất khẩu bưởi
 */
export interface IRegisterDto {
  ho_ten: string;
  so_dien_thoai?: string;
  email?: string;
  mat_khau: string;
  vai_tro?: VaiTroNguoiDung;
  vung_trong_id?: number;
}
export type RegisterDto = IRegisterDto;

/**
 * Interface cho DTO Đổi mật khẩu bảo mật
 */
export interface IChangePasswordDto {
  mat_khau_cu: string;
  mat_khau_moi: string;
}
export type ChangePasswordDto = IChangePasswordDto;

/**
 * Interface định nghĩa dữ liệu chi tiết Hồ sơ người dùng AgriLog (UserProfile)
 */
export interface IUserProfile {
  id: number;
  ho_ten: string;
  so_dien_thoai?: string;
  email?: string;
  vai_tro: VaiTroNguoiDung;
  vung_trong_id?: number;
  trang_thai: boolean;
  ngay_tao: string | Date;
}
export type UserProfile = IUserProfile;

/**
 * Interface kết quả trả về sau khi Đăng nhập / Đăng ký thành công
 */
export interface IAuthResponse {
  access_token: string;
  user: IUserProfile;
}
export type AuthResponse = IAuthResponse;
