import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ICreateMaterialDto } from 'agrilog-shared';

export class CreateMaterialDto implements ICreateMaterialDto {
  @ApiProperty({
    example: 'Phân bón NPK 20-20-15',
    description: 'Tên vật tư nông nghiệp (Phân bón, Thuốc trừ sâu, Hạt giống, Công cụ...)',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Phân bón',
    description: 'Danh mục phân loại vật tư (Phân bón, Thuốc BVTV, Hạt giống, Bao bì...)',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Tổng Công ty Phân bón Bình Điền',
    description: 'Nhà sản xuất hoặc thương hiệu',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Đơn vị tính tiêu chuẩn (kg, lít, bao, chai, gói...)',
  })
  @IsOptional()
  @IsString()
  default_unit?: string;

  @ApiPropertyOptional({
    example: 'Phân bón vô cơ đa lượng chất lượng cao, tăng cường sinh trưởng cây trồng',
    description: 'Mô tả chi tiết và hướng dẫn bảo quản vật tư',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
