import { ApiProperty } from '@nestjs/swagger';
import { IAuthResponseDto, IUserProfileDto, UserRole, UserStatus } from 'agrilog-shared';

export class UserProfileDto implements IUserProfileDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'nongdan_tu' })
  username!: string;

  @ApiProperty({ example: 'tu@agrilog.vn' })
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn Tư' })
  full_name!: string;

  @ApiProperty({ example: '0901234567', required: false })
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.FARMER })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiProperty({ required: false })
  avatar_url?: string;
}

export class AuthResponseDto implements IAuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  access_token!: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refresh_token!: string;

  @ApiProperty({ example: 86400, description: 'Thời gian hết hạn của access token (giây)' })
  expires_in!: number;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({ type: () => UserProfileDto })
  user!: UserProfileDto;
}
