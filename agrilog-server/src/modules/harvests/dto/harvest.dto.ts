import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ICreateHarvestDto,
  IHarvestDto,
  IUpdateHarvestDto,
} from 'agrilog-shared';

export class CreateHarvestDto implements ICreateHarvestDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      'ID nhật ký canh tác (Activity) - tùy chọn khi gọi qua sub-resource /api/activities/:id/harvests',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_id?: number;

  @ApiProperty({
    example: 1500.5,
    description: 'Sản lượng thu hoạch (kg, tấn, thùng...)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Đơn vị tính sản lượng',
    default: 'kg',
  })
  @IsOptional()
  @IsString()
  unit?: string = 'kg';

  @ApiPropertyOptional({
    example: 'Loại 1 (Xuất khẩu)',
    description: 'Phân loại / tiêu chuẩn chất lượng',
  })
  @IsOptional()
  @IsString()
  quality?: string;

  @ApiPropertyOptional({
    example: 'Công ty TNHH Nông sản Sạch',
    description: 'Tên thương lái / đối tác mua hàng',
  })
  @IsOptional()
  @IsString()
  buyer?: string;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Đơn giá hoặc giá trị bán',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  selling_price?: number;
}

export class UpdateHarvestDto implements IUpdateHarvestDto {
  @ApiPropertyOptional({ example: 1, description: 'ID nhật ký canh tác' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_id?: number;

  @ApiPropertyOptional({
    example: 1800,
    description: 'Sản lượng thu hoạch cập nhật',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    example: 'Loại 1',
    description: 'Phân loại / tiêu chuẩn chất lượng',
  })
  @IsOptional()
  @IsString()
  quality?: string;

  @ApiPropertyOptional({
    example: 'Thương lái Bảy',
    description: 'Thương lái / đối tác mua',
  })
  @IsOptional()
  @IsString()
  buyer?: string;

  @ApiPropertyOptional({ example: 28000, description: 'Giá bán' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  selling_price?: number;
}

export class HarvestResponseDto implements IHarvestDto {
  @ApiProperty({ example: 1, description: 'ID ghi nhận thu hoạch' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID nhật ký canh tác' })
  activity_id!: number;

  @ApiProperty({ example: 1500.5, description: 'Sản lượng thu hoạch' })
  quantity!: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính' })
  unit?: string;

  @ApiPropertyOptional({
    example: 'Loại 1 (Xuất khẩu)',
    description: 'Phân loại chất lượng',
  })
  quality?: string;

  @ApiPropertyOptional({
    example: 'Công ty TNHH Nông sản Sạch',
    description: 'Thương lái / đối tác',
  })
  buyer?: string;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Đơn giá bán',
  })
  selling_price?: number;

  @ApiProperty({ description: 'Thời gian tạo' })
  created_at!: string | Date;

  @ApiPropertyOptional({
    example: 'Thu hoạch Bưởi Da Xanh đợt 1',
    description: 'Mô tả hoạt động canh tác',
  })
  activity_description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID mùa vụ' })
  season_id?: number;

  @ApiPropertyOptional({
    example: 'Vụ Bưởi Tết 2026',
    description: 'Tên mùa vụ liên quan',
  })
  season_name?: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Nông dân phụ trách',
  })
  farmer_name?: string;

  @ApiPropertyOptional({
    example: 37512500,
    description: 'Tổng giá trị ước tính (quantity * selling_price)',
  })
  total_revenue?: number;
}
