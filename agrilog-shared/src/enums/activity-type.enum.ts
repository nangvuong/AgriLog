/**
 * Enum loại hoạt động ghi nhận trong nhật ký canh tác bưởi
 */
export enum LoaiHoatDongCanhTac {
  BON_PHAN = 'bon_phan',
  TUOI_NUOC = 'tuoi_nuoc',
  PHUN_THUOC_BVTV = 'phun_thuoc_bvtv',
  CAT_TIA = 'cat_tia',
  KIEM_TRA_SAU_BENH = 'kiem_tra_sau_benh',
  THU_HOACH = 'thu_hoach',
  KIEM_DINH_MAU = 'kiem_dinh_mau',
}

export const ACTIVITY_LABELS: Record<LoaiHoatDongCanhTac, string> = {
  [LoaiHoatDongCanhTac.BON_PHAN]: 'Bón phân & Dinh dưỡng',
  [LoaiHoatDongCanhTac.TUOI_NUOC]: 'Tưới tiêu nước',
  [LoaiHoatDongCanhTac.PHUN_THUOC_BVTV]: 'Phun thuốc bảo vệ thực vật',
  [LoaiHoatDongCanhTac.CAT_TIA]: 'Cắt tỉa cành & dọn vườn',
  [LoaiHoatDongCanhTac.KIEM_TRA_SAU_BENH]: 'Kiểm tra sâu bệnh định kỳ',
  [LoaiHoatDongCanhTac.THU_HOACH]: 'Thu hoạch quả bưởi',
  [LoaiHoatDongCanhTac.KIEM_DINH_MAU]: 'Lấy mẫu kiểm nghiệm dư lượng',
};
