import { UserRole, UserStatus } from '../enums/user.enum';

export interface ILoginRequestDto {
  username: string;
  password: string;
}

export interface IRegisterRequestDto {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
}

export interface IRefreshTokenRequestDto {
  refresh_token: string;
}

export interface IUserProfileDto {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface IAuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: IUserProfileDto;
}

export interface IUserTokenPayload {
  sub: number;
  username: string;
  email: string;
  role: UserRole;
}
