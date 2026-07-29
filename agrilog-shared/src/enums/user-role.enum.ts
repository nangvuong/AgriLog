/**
 * Enum vai trò người dùng trong hệ thống nhật ký bưởi xuất khẩu AgriLog
 */
export enum VaiTroNguoiDung {
  NONG_DAN = 'nong_dan',
  QUAN_LY = 'quan_ly',
  KY_THUAT = 'ky_thuat',
  XUAT_KHAU = 'xuat_khau',
  KIEM_DINH = 'kiem_dinh',
  ADMIN = 'admin',
}

export interface RoleMetadata {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

/**
 * Metadata thông tin hiển thị và kiểu dáng cho từng vai trò
 */
export const ROLE_INFO: Record<VaiTroNguoiDung, RoleMetadata> = {
  [VaiTroNguoiDung.NONG_DAN]: {
    label: 'Nông dân trồng bưởi',
    description: 'Chăm sóc vườn, ghi chép nhật ký canh tác & thu hoạch',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
  },
  [VaiTroNguoiDung.QUAN_LY]: {
    label: 'Quản lý Hợp tác xã',
    description: 'Quản lý các vườn bưởi thành viên, duyệt lô xuất khẩu',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  [VaiTroNguoiDung.KY_THUAT]: {
    label: 'Kỹ thuật viên GlobalGAP',
    description: 'Hướng dẫn quy trình, kiểm tra nhật ký sử dụng thuốc & phân',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  [VaiTroNguoiDung.XUAT_KHAU]: {
    label: 'Doanh nghiệp xuất khẩu',
    description: 'Thu mua lô bưởi, quản lý truy xuất mã QR đi Mỹ/EU',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  [VaiTroNguoiDung.KIEM_DINH]: {
    label: 'Cơ quan kiểm định',
    description: 'Kiểm nghiệm dư lượng BVTV & chứng nhận tiêu chuẩn GlobalGAP',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
  },
  [VaiTroNguoiDung.ADMIN]: {
    label: 'Quản trị hệ thống',
    description: 'Quản lý tài khoản, cấu hình mã vùng trồng quốc gia',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
};
