export type VaiTroNguoiDung =
  | 'nong_dan'
  | 'quan_ly'
  | 'ky_thuat'
  | 'xuat_khau'
  | 'kiem_dinh'
  | 'admin';

export interface UserProfile {
  id: number;
  ho_ten: string;
  so_dien_thoai?: string;
  email?: string;
  vai_tro: VaiTroNguoiDung;
  vung_trong_id?: number;
  trang_thai: boolean;
  ngay_tao: string | Date;
}

export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

export interface LoginDto {
  so_dien_thoai_hoac_email: string;
  mat_khau: string;
}

export interface RegisterDto {
  ho_ten: string;
  so_dien_thoai?: string;
  email?: string;
  mat_khau: string;
  vai_tro?: VaiTroNguoiDung;
  vung_trong_id?: number;
}

export interface ChangePasswordDto {
  mat_khau_cu: string;
  mat_khau_moi: string;
}

export const ROLE_INFO: Record<
  VaiTroNguoiDung,
  { label: string; description: string; color: string; bg: string; border: string }
> = {
  nong_dan: {
    label: 'Nông dân trồng bưởi',
    description: 'Chăm sóc vườn, ghi chép nhật ký canh tác & thu hoạch',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
  },
  quan_ly: {
    label: 'Quản lý Hợp tác xã',
    description: 'Quản lý các vườn bưởi thành viên, duyệt lô xuất khẩu',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  ky_thuat: {
    label: 'Cán bộ Kỹ thuật',
    description: 'Giám sát dịch hại, hướng dẫn bón phân & tiêu chuẩn GlobalGAP',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  xuat_khau: {
    label: 'Doanh nghiệp Xuất khẩu',
    description: 'Cơ sở đóng gói, tạo mã QR truy xuất và làm thủ tục xuất khẩu',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
  },
  kiem_dinh: {
    label: 'Cơ quan Kiểm định',
    description: 'Kiểm tra chất lượng dư lượng thuốc bảo vệ thực vật',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
  },
  admin: {
    label: 'Quản trị Hệ thống',
    description: 'Toàn quyền cấu hình hệ thống & phân quyền người dùng',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
};
