import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IRegisterRequestDto, UserRole } from 'agrilog-shared';

export class RegisterRequestDto implements IRegisterRequestDto {
  @ApiProperty({
    example: 'nongdan_minh',
    description: 'Tên đăng nhập mới (duy nhất)',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'minh.nongdan@agrilog.vn',
    description: 'Địa chỉ email liên hệ',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'matkhau123',
    description: 'Mật khẩu từ 6 ký tự trở lên',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({
    example: 'Nguyễn Văn Minh',
    description: 'Họ và tên người dùng',
  })
  @IsNotEmpty()
  @IsString()
  full_name!: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Số điện thoại liên hệ',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.FARMER,
    description: 'Vai trò người dùng trong hệ thống nông nghiệp',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
