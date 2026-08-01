import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { VaiTroNguoiDung, type IUserQueryDto } from 'agrilog-shared';

export class UserQueryDto implements IUserQueryDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (họ tên, số điện thoại, email)',
    example: 'Nguyễn Văn Nông',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: VaiTroNguoiDung,
    description: 'Lọc theo vai trò trong chuỗi cung ứng bưởi',
    example: VaiTroNguoiDung.NONG_DAN,
  })
  @IsOptional()
  @IsEnum(VaiTroNguoiDung)
  vai_tro?: VaiTroNguoiDung;

  @ApiPropertyOptional({
    description: 'Lọc theo ID vùng trồng / Hợp tác xã',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vung_trong_id?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hoạt động (true = active, false = locked)',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  trang_thai?: boolean;

  @ApiPropertyOptional({
    description: 'Số trang hiện tại (mặc định 1)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng kết quả trên mỗi trang (mặc định 20)',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
