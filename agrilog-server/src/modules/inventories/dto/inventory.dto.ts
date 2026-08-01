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
  ICreateInventoryDto,
  IInventoryDto,
  IUpdateInventoryDto,
} from 'agrilog-shared';

export class CreateInventoryDto implements ICreateInventoryDto {
  @ApiProperty({ example: 1, description: 'ID trang trại (Farm)' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  farm_id!: number;

  @ApiProperty({ example: 1, description: 'ID vật tư nông nghiệp (Material)' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  material_id!: number;

  @ApiProperty({
    example: 500,
    description: 'Số lượng tồn kho ban đầu hoặc nhập kho',
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Đơn vị tính tồn kho (nếu để trống, dùng đơn vị chuẩn của vật tư)',
  })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class UpdateInventoryDto implements IUpdateInventoryDto {
  @ApiPropertyOptional({ example: 450, description: 'Số lượng tồn kho cập nhật' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính tồn kho' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class InventoryResponseDto implements IInventoryDto {
  @ApiProperty({ example: 1, description: 'ID bản ghi tồn kho' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID trang trại' })
  farm_id!: number;

  @ApiProperty({ example: 1, description: 'ID vật tư nông nghiệp' })
  material_id!: number;

  @ApiProperty({ example: 500, description: 'Số lượng tồn kho hiện tại' })
  quantity!: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính' })
  unit?: string;

  @ApiProperty({ description: 'Thời gian cập nhật gần nhất' })
  updated_at!: string | Date;

  @ApiPropertyOptional({
    example: 'Trang trại Bưởi Da Xanh Bến Tre',
    description: 'Tên trang trại',
  })
  farm_name?: string;

  @ApiPropertyOptional({
    example: 'Phân hữu cơ vi sinh Đầu Trâu',
    description: 'Tên vật tư nông nghiệp',
  })
  material_name?: string;

  @ApiPropertyOptional({
    example: 'fertilizer',
    description: 'Phân loại vật tư',
  })
  material_category?: string;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Đơn vị chuẩn của vật tư',
  })
  material_default_unit?: string;
}
