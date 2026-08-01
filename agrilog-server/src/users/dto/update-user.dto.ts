import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { VaiTroNguoiDung, type IUpdateUserDto } from 'agrilog-shared';

export class UpdateUserDto implements IUpdateUserDto {
  @ApiPropertyOptional({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn Nông - Cập nhật',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  ho_ten?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0901234567',
  })
  @IsOptional()
  @IsString()
  so_dien_thoai?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ Email',
    example: 'nongdan@agrilog.vn',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({
    enum: VaiTroNguoiDung,
    description: 'Vai trò trong chuỗi cung ứng',
    example: VaiTroNguoiDung.NONG_DAN,
  })
  @IsOptional()
  @IsEnum(VaiTroNguoiDung, { message: 'Vai trò không hợp lệ' })
  vai_tro?: VaiTroNguoiDung;

  @ApiPropertyOptional({
    description: 'ID vùng trồng quản lý',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  vung_trong_id?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động (true = hoạt động, false = tạm khóa)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class UpdateUserStatusDto {
  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt tài khoản',
    example: true,
  })
  @IsBoolean()
  trang_thai!: boolean;
}
