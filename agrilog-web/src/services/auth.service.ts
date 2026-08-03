import { IAuthResponseDto, IUserProfileDto, UserRole } from 'agrilog-shared';
import apiClient from './api/axios.client';

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<IAuthResponseDto> {
    const response = await apiClient.post<IAuthResponseDto>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<IAuthResponseDto> {
    const response = await apiClient.post<IAuthResponseDto>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getProfile(): Promise<IUserProfileDto> {
    const response = await apiClient.get<IUserProfileDto>('/auth/profile');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<IAuthResponseDto> {
    const response = await apiClient.post<IAuthResponseDto>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;
