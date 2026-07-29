/**
 * Enum các tiêu chuẩn kiểm định & chất lượng chuỗi bưởi xuất khẩu
 */
export enum TieuChuanKiemDinh {
  GLOBAL_GAP = 'globalgap',
  VIET_GAP = 'vietgap',
  USDA_ORGANIC = 'usda_organic',
  EU_STANDARD = 'eu_standard',
}

export const STANDARD_LABELS: Record<TieuChuanKiemDinh, string> = {
  [TieuChuanKiemDinh.GLOBAL_GAP]: 'GlobalG.A.P. (#VN-2026)',
  [TieuChuanKiemDinh.VIET_GAP]: 'VietGAP Tiêu chuẩn Quốc gia',
  [TieuChuanKiemDinh.USDA_ORGANIC]: 'USDA Organic (Hoa Kỳ)',
  [TieuChuanKiemDinh.EU_STANDARD]: 'EU MRL Standard (Liên minh Châu Âu)',
};
