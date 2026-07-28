import {
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UserProfile,
  VaiTroNguoiDung,
} from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

// Tùy chọn Demo Mock Mode (tự động bật nếu API Server chưa khởi động)
export let isDemoMode = false;

export function setDemoMode(mode: boolean) {
  isDemoMode = mode;
}

export async function loginApi(dto: LoginDto): Promise<AuthResponse> {
  if (isDemoMode) {
    await new Promise((res) => setTimeout(res, 600));
    const demoUser: UserProfile = {
      id: 1,
      ho_ten: 'Nguyễn Văn Nông (Demo)',
      so_dien_thoai: dto.so_dien_thoai_hoac_email,
      email: 'nongdan.demo@agrilog.vn',
      vai_tro: 'nong_dan',
      vung_trong_id: 1,
      trang_thai: true,
      ngay_tao: new Date().toISOString(),
    };
    return {
      access_token: 'demo-jwt-token-agrilog-2026',
      user: demoUser,
    };
  }

  const res = await fetch(`${API_BASE_URL}/login`, {
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
  if (isDemoMode) {
    await new Promise((res) => setTimeout(res, 800));
    const demoUser: UserProfile = {
      id: 2,
      ho_ten: dto.ho_ten,
      so_dien_thoai: dto.so_dien_thoai || '0900000000',
      email: dto.email || 'newuser@agrilog.vn',
      vai_tro: dto.vai_tro || 'nong_dan',
      vung_trong_id: dto.vung_trong_id || 1,
      trang_thai: true,
      ngay_tao: new Date().toISOString(),
    };
    return {
      access_token: 'demo-jwt-token-register-agrilog',
      user: demoUser,
    };
  }

  const res = await fetch(`${API_BASE_URL}/register`, {
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
  if (isDemoMode || token.startsWith('demo-')) {
    await new Promise((res) => setTimeout(res, 400));
    return {
      id: 1,
      ho_ten: 'Nguyễn Văn Nông (Demo Profile)',
      so_dien_thoai: '0901234567',
      email: 'nongdan.demo@agrilog.vn',
      vai_tro: 'nong_dan',
      vung_trong_id: 1,
      trang_thai: true,
      ngay_tao: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/me`, {
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
  if (isDemoMode || token.startsWith('demo-')) {
    await new Promise((res) => setTimeout(res, 600));
    return { message: 'Đổi mật khẩu thành công (Chế độ Demo)' };
  }

  const res = await fetch(`${API_BASE_URL}/change-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Đổi mật khẩu không thành công. Mật khẩu cũ không đúng.');
  }

  return res.json();
}
