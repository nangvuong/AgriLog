import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VaiTroNguoiDung } from './register.dto';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ID người dùng' })
  id!: number;

  @ApiProperty({ example: 'Nguyễn Văn Nông', description: 'Họ và tên' })
  ho_ten!: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Số điện thoại' })
  so_dien_thoai?: string;

  @ApiPropertyOptional({ example: 'nongdan@agrilog.vn', description: 'Email' })
  email?: string;

  @ApiProperty({
    enum: VaiTroNguoiDung,
    example: VaiTroNguoiDung.NONG_DAN,
    description: 'Vai trò trong hệ thống',
  })
  vai_tro!: VaiTroNguoiDung;

  @ApiPropertyOptional({ example: 1, description: 'ID vùng trồng quản lý' })
  vung_trong_id?: number;

  @ApiProperty({ example: true, description: 'Trạng thái hoạt động' })
  trang_thai!: boolean;

  @ApiProperty({
    example: '2026-07-28T09:00:00.000Z',
    description: 'Ngày tạo tài khoản',
  })
  ngay_tao!: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Access Token để chứng thực cho các API bảo mật',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'Thông tin hồ sơ người dùng',
    type: UserProfileDto,
  })
  user!: UserProfileDto;
}
