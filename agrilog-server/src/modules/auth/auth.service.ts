import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService, UserEntity } from '../users';
import { RedisService } from '../../redis';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  UserProfileDto,
} from './dto';
import { IUserTokenPayload, UserRole, UserStatus } from 'agrilog-shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByUsername(dto.username);
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    if (dto.email) {
      const existingEmail = await this.usersService.findByEmail(dto.email);
      if (existingEmail) {
        throw new ConflictException('Email address is already in use');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password_hash: passwordHash,
      role: dto.role || UserRole.FARMER,
      status: UserStatus.ACTIVE,
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshTokenToRedis(user.id, tokens.refresh_token);
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: 86400,
      token_type: 'Bearer',
      user: this.mapToProfileDto(user),
    };
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is disabled or suspended');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshTokenToRedis(user.id, tokens.refresh_token);
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: 86400,
      token_type: 'Bearer',
      user: this.mapToProfileDto(user),
    };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Access denied - user not found');
    }

    const storedHash = await this.redisService.getRefreshToken(userId);
    if (!storedHash) {
      throw new UnauthorizedException('Access denied - session expired or logged out');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, storedHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshTokenToRedis(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: 86400,
      token_type: 'Bearer',
      user: this.mapToProfileDto(user),
    };
  }

  async logout(userId: number): Promise<void> {
    await this.redisService.removeRefreshToken(userId);
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }
    return this.mapToProfileDto(user);
  }

  private async generateTokens(user: UserEntity) {
    const payload: IUserTokenPayload = {
      sub: Number(user.id),
      username: user.username,
      email: user.email || '',
      role: user.role,
    };

    const accessSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'agrilog_secret_key_development_only';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      accessSecret ||
      'agrilog_refresh_secret_key_development_only';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async saveRefreshTokenToRedis(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    // Lưu vào Redis với TTL 7 ngày (604800 giây)
    await this.redisService.setRefreshToken(userId, hash, 604800);
  }

  private mapToProfileDto(user: UserEntity): UserProfileDto {
    return {
      id: Number(user.id),
      username: user.username,
      email: user.email || '',
      full_name: user.username,
      role: user.role,
      status: user.status,
      avatar_url: undefined,
    };
  }
}
