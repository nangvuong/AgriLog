/**
 * Enum trạng thái lô bưởi trong chuỗi canh tác & xuất khẩu
 */
export enum TrangThaiLoBuoi {
  DANG_CANH_TAC = 'dang_canh_tac',
  CHUAN_BI_THU_HOACH = 'chuan_bi_thu_hoach',
  DA_THU_HOACH = 'da_thu_hoach',
  KIEM_DINH_DAT = 'kiem_dinh_dat',
  KIEM_DINH_KHONG_DAT = 'kiem_dinh_khong_dat',
  DA_XUAT_KHAU = 'da_xuat_khau',
}

export interface StatusMetadata {
  label: string;
  badgeVariant: 'green' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const STATUS_INFO: Record<TrangThaiLoBuoi, StatusMetadata> = {
  [TrangThaiLoBuoi.DANG_CANH_TAC]: {
    label: 'Đang canh tác',
    badgeVariant: 'green',
  },
  [TrangThaiLoBuoi.CHUAN_BI_THU_HOACH]: {
    label: 'Chuẩn bị thu hoạch',
    badgeVariant: 'amber',
  },
  [TrangThaiLoBuoi.DA_THU_HOACH]: {
    label: 'Đã thu hoạch',
    badgeVariant: 'blue',
  },
  [TrangThaiLoBuoi.KIEM_DINH_DAT]: {
    label: 'Kiểm định đạt chuẩn GlobalGAP',
    badgeVariant: 'emerald',
  },
  [TrangThaiLoBuoi.KIEM_DINH_KHONG_DAT]: {
    label: 'Kiểm định không đạt',
    badgeVariant: 'rose',
  },
  [TrangThaiLoBuoi.DA_XUAT_KHAU]: {
    label: 'Đã thông quan xuất khẩu',
    badgeVariant: 'blue',
  },
};
