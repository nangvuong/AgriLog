import { create } from 'zustand';
import { IAuthResponseDto, IUserProfileDto, UserRole } from 'agrilog-shared';
import { authService, LoginCredentials, RegisterData } from '@/services/auth.service';

interface AuthState {
  user: IUserProfileDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<IAuthResponseDto>;
  register: (data: RegisterData) => Promise<IAuthResponseDto>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<IUserProfileDto | null>;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: IUserProfileDto | null) => void;
  clearError: () => void;
}

const getStoredToken = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getStoredUser = (): IUserProfileDto | null => {
  try {
    const item = localStorage.getItem('agrilog_user');
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  accessToken: getStoredToken('agrilog_access_token'),
  refreshToken: getStoredToken('agrilog_refresh_token'),
  isAuthenticated: !!getStoredToken('agrilog_access_token'),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('agrilog_access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('agrilog_refresh_token', response.refresh_token);
      }
      localStorage.setItem('agrilog_user', JSON.stringify(response.user));

      set({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.';
      set({
        isLoading: false,
        error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
      });
      throw err;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      localStorage.setItem('agrilog_access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('agrilog_refresh_token', response.refresh_token);
      }
      localStorage.setItem('agrilog_user', JSON.stringify(response.user));

      set({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || 'Đăng ký tài khoản thất bại.';
      set({
        isLoading: false,
        error: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('agrilog_access_token');
      localStorage.removeItem('agrilog_refresh_token');
      localStorage.removeItem('agrilog_user');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const userProfile = await authService.getProfile();
      localStorage.setItem('agrilog_user', JSON.stringify(userProfile));
      set({ user: userProfile, isAuthenticated: true, isLoading: false });
      return userProfile;
    } catch (err) {
      set({ isLoading: false });
      return null;
    }
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('agrilog_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('agrilog_refresh_token', refreshToken);
    }
    set({
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user: IUserProfileDto | null) => {
    if (user) {
      localStorage.setItem('agrilog_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agrilog_user');
    }
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
