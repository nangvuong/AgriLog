/**
 * Enum mức độ cảnh báo GlobalGAP trên trang chủ nông dân
 */
export enum FarmerAlertLevel {
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Enum nhãn phân loại cảnh báo
 */
export enum FarmerAlertTag {
  CAN_CHU_Y = 'Cần chú ý',
  SAP_TOI = 'Sắp tới',
  QUAN_TRONG = 'Quan trọng',
}

/**
 * Enum trạng thái vụ mùa canh tác bưởi
 */
export enum FarmerSeasonStatus {
  DANG_CANH_TAC = 'dang_canh_tac',
  THU_HOACH = 'thu_hoach',
  HOAN_THANH = 'hoan_thanh',
}

/**
 * Enum kênh nhập liệu nhật ký nhanh (Nói / Chụp / Gõ)
 */
export enum QuickLogChannel {
  MIC = 'mic',
  CAM = 'cam',
  TEXT = 'text',
}
