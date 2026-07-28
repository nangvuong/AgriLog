import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum VaiTroNguoiDung {
  NONG_DAN = 'nong_dan',
  QUAN_LY = 'quan_ly',
  KY_THUAT = 'ky_thuat',
  XUAT_KHAU = 'xuat_khau',
  KIEM_DINH = 'kiem_dinh',
  ADMIN = 'admin',
}

export class RegisterDto {
  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn Nông',
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  ho_ten!: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ (duy nhất)',
    example: '0901234567',
  })
  @IsOptional()
  @IsString()
  so_dien_thoai?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ email (duy nhất)',
    example: 'nongdan@agrilog.vn',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập (ít nhất 6 ký tự)',
    example: 'matkhau123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  mat_khau!: string;

  @ApiPropertyOptional({
    description: 'Vai trò người dùng trong chuỗi cung ứng bưởi',
    enum: VaiTroNguoiDung,
    default: VaiTroNguoiDung.NONG_DAN,
  })
  @IsOptional()
  @IsEnum(VaiTroNguoiDung, { message: 'Vai trò không hợp lệ' })
  vai_tro?: VaiTroNguoiDung;

  @ApiPropertyOptional({
    description: 'ID của Vùng trồng mà người dùng trực thuộc (nếu có)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'ID vùng trồng phải là số nguyên' })
  vung_trong_id?: number;
}
