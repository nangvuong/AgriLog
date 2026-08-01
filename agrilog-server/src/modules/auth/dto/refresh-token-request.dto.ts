import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IRefreshTokenRequestDto } from 'agrilog-shared';

export class RefreshTokenRequestDto implements IRefreshTokenRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token hợp lệ do hệ thống cấp',
  })
  @IsNotEmpty()
  @IsString()
  refresh_token!: string;
}
