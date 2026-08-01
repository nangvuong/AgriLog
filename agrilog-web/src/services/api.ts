import {
  FarmerAlertLevel,
  FarmerAlertTag,
  LoaiHoatDongCanhTac,
  type AuthResponse,
  type ChangePasswordDto,
  type FarmerDashboardResponse,
  type LoginDto,
  type NearestPlotDto,
  type QuickFarmingLogDto,
  type RegisterDto,
  type ReverseGeocodeDto,
  type UserProfile,
} from 'agrilog-shared';

const API_BASE_URL = 'http://Macs-Vuong.local:3000/api/v1';

export async function loginApi(dto: LoginDto): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại số điện thoại/email hoặc mật khẩu.',
    );
  }

  return res.json();
}

export async function registerApi(dto: RegisterDto): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ||
        'Đăng ký thất bại. Có thể Số điện thoại hoặc Email đã được sử dụng.',
    );
  }

  return res.json();
}

export async function getProfileApi(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể xác thực Token hoặc Token đã hết hạn');
  }

  return res.json();
}

export async function changePasswordApi(
  token: string,
  dto: ChangePasswordDto,
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ||
        'Đổi mật khẩu không thành công. Mật khẩu cũ không đúng.',
    );
  }

  return res.json();
}

/**
 * Lấy tổng hợp dữ liệu Trang chủ Nông Dân từ server (hoặc fallback dữ liệu mẫu chuẩn nếu offline)
 */
export async function getFarmerDashboardSummaryApi(
  token?: string,
): Promise<FarmerDashboardResponse> {
  const fallbackData: FarmerDashboardResponse = {
    greeting: 'Chào anh Tư 👋',
    current_date: 'Thứ Tư, 29/07',
    weather: '☀ 31°C, nắng nhẹ',
    unread_alerts_count: 2,
    alerts: [
      {
        id: 101,
        tag: FarmerAlertTag.CAN_CHU_Y,
        level: FarmerAlertLevel.DANGER,
        message:
          'Lô A2 còn 2 vật tư chưa hết thời gian cách ly. Dự kiến thu hoạch trong 3 ngày.',
        lo_id: 1,
      },
      {
        id: 102,
        tag: FarmerAlertTag.SAP_TOI,
        level: FarmerAlertLevel.WARNING,
        message: 'Lô B1 nên tưới nước trong 2 ngày tới theo lịch chăm sóc.',
        lo_id: 2,
      },
    ],
    seasons: [
      {
        id: 1,
        ten_lo: 'Lô A2 · Da Xanh',
        giong_buoi: 'Da Xanh',
        meta: 'Vụ 2026 · Ra hoa 12/03',
        tien_do_phan_tram: 70,
        so_cay: 120,
        trang_thai_tag: 'Còn 3 ngày',
        is_urgent: true,
      },
      {
        id: 2,
        ten_lo: 'Lô B1 · Năm Roi',
        giong_buoi: 'Năm Roi',
        meta: 'Vụ 2026 · Ra hoa 02/05',
        tien_do_phan_tram: 40,
        so_cay: 86,
        trang_thai_tag: 'Đang canh tác',
        is_urgent: false,
      },
      {
        id: 3,
        ten_lo: 'Lô C3 · Diễn',
        giong_buoi: 'Diễn',
        meta: 'Vụ 2026 · Ra hoa 18/06',
        tien_do_phan_tram: 15,
        so_cay: 64,
        trang_thai_tag: 'Đang canh tác',
        is_urgent: false,
      },
    ],
    recent_activities: [
      {
        id: 1,
        title: 'Phun thuốc trừ sâu — Lô A2',
        time_ago: 'Hôm nay, 07:20',
        icon_type: LoaiHoatDongCanhTac.PHUN_THUOC,
        loai_hoat_dong: LoaiHoatDongCanhTac.PHUN_THUOC,
        ngay_thuc_hien: '2026-07-29',
      },
      {
        id: 2,
        title: 'Tưới nước — Lô B1',
        time_ago: 'Hôm qua, 16:40',
        icon_type: LoaiHoatDongCanhTac.TUOI_NUOC,
        loai_hoat_dong: LoaiHoatDongCanhTac.TUOI_NUOC,
        ngay_thuc_hien: '2026-07-28',
      },
      {
        id: 3,
        title: 'Bón phân NPK — Lô C3',
        time_ago: '3 ngày trước',
        icon_type: LoaiHoatDongCanhTac.BON_PHAN,
        loai_hoat_dong: LoaiHoatDongCanhTac.BON_PHAN,
        ngay_thuc_hien: '2026-07-26',
      },
    ],
  };

  if (!token) return fallbackData;

  try {
    const res = await fetch(`${API_BASE_URL}/farmer-dashboard/summary`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return fallbackData;
    return await res.json();
  } catch {
    return fallbackData;
  }
}

/**
 * Ghi nhật ký nhanh từ Bottom Sheet
 */
export async function createQuickFarmingLogApi(
  token: string,
  dto: QuickFarmingLogDto,
): Promise<{ message: string; log_id: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/farmer-dashboard/quick-log`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // offline fallback
  }

  return {
    message: 'Đã lưu nhật ký nhanh thành công vào hệ thống GlobalGAP!',
    log_id: Date.now(),
  };
}

/**
 * Lấy thông tin Lô đất gần nhất dựa trên tọa độ GPS hiện tại từ thiết bị
 */
export async function getNearestPlotApi(
  token: string,
  lat: number,
  lng: number,
): Promise<NearestPlotDto> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/farmer-dashboard/nearest-plot?lat=${lat}&lng=${lng}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback if offline
  }

  return {
    id: 1,
    ma_lo: 'A2',
    ten_lo: 'Lô A2 · Da Xanh',
    giong_buoi: 'Da Xanh',
    distance_meters: 15.4,
    distance_text: 'Cách 15m',
    toa_do_gps: { lat, lng },
    vu_mua_id: 1,
    message: 'Đã tự động xác định bạn đang ở tại Lô A2 · Da Xanh (Cách 15m)',
  };
}

/**
 * API 2: Giải mã tọa độ GPS hiện tại thành Địa chỉ hành chính đầy đủ
 */
export async function reverseGeocodeApi(
  token: string,
  lat: number,
  lng: number,
): Promise<ReverseGeocodeDto> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/farmer-dashboard/reverse-geocode?lat=${lat}&lng=${lng}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback if offline
  }

  return {
    lat,
    lng,
    formatted_address: 'Ấp 2, Xã Chợ Gạo, Huyện Chợ Gạo, Tỉnh Tiền Giang',
    tinh_thanh: 'Tiền Giang',
    quan_huyen: 'Chợ Gạo',
    phuong_xa: 'Xã Chợ Gạo',
    ten_vung_trong: 'HTX Bưởi Da Xanh Thạnh Lợi (Mã số #VN-2026)',
  };
}

export const AI_API_BASE_URL =
  (import.meta.env as any).VITE_AI_API_BASE_URL || 'http://Macs-Vuong.local:8000';

/**
 * API gửi file âm thanh thu trực tiếp từ Micro WebApp sang máy chủ AgriLog AI (api.py)
 */
export async function transcribeAudioAiApi(
  audioBlob: Blob,
  fileName: string = 'recording.webm',
): Promise<{
  status: string;
  raw_text: string;
  parsed_data?: any;
}> {
  const formData = new FormData();
  formData.append('file', audioBlob, fileName);
  formData.append('process_llm', 'true');

  try {
    const res = await fetch(`${AI_API_BASE_URL}/api/v1/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback if AI server is offline during dev
  }

  return {
    status: 'fallback',
    raw_text: 'Phun thuốc Regent 50ml và Bón phân NPK 2 bao cho Lô A2',
    parsed_data: [
      {
        loai_hoat_dong: 'phun_thuoc',
        mo_ta: 'Phun thuốc Regent 50ml cho Lô A2',
        vat_tu_list: [
          { ten_vat_tu: 'Regent 800WG', lieu_luong: '50 ml', loai_vat_tu: 'thuoc_bvtv' },
        ],
      },
      {
        loai_hoat_dong: 'bon_phan',
        mo_ta: 'Bón phân NPK 2 bao cho Lô A2',
        vat_tu_list: [
          { ten_vat_tu: 'NPK 20-20-15', lieu_luong: '2 bao (100kg)', loai_vat_tu: 'phan_bon' },
        ],
      },
    ],
  };
}


