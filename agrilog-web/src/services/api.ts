import type {
  AuthResponse,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UserProfile,
} from 'agrilog-shared';

const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

export async function loginApi(dto: LoginDto): Promise<AuthResponse> {
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
    throw new Error(
      err.message ||
        'Đổi mật khẩu không thành công. Mật khẩu cũ không đúng.',
    );
  }

  return res.json();
}
