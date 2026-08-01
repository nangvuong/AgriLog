import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICreateSeasonDto, SeasonStatus } from 'agrilog-shared';

export class CreateSeasonDto implements ICreateSeasonDto {
  @ApiProperty({
    example: 1,
    description: 'ID của lô/vườn đất canh tác (Plot ID)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  plot_id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID của giống cây trồng (Crop Variety ID)',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  crop_variety_id!: number;

  @ApiProperty({
    example: '2026-02-01',
    description: 'Ngày xuống giống / Gieo trồng (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  planting_date!: string;

  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'Ngày thu hoạch dự kiến (YYYY-MM-DD, phải >= planting_date)',
  })
  @IsOptional()
  @IsDateString()
  expected_harvest_date?: string;

  @ApiPropertyOptional({
    example: '2026-10-12',
    description: 'Ngày thu hoạch thực tế (YYYY-MM-DD, phải >= planting_date)',
  })
  @IsOptional()
  @IsDateString()
  actual_harvest_date?: string;

  @ApiPropertyOptional({
    enum: SeasonStatus,
    default: SeasonStatus.PLANNED,
    description: 'Trạng thái mùa vụ (PLANNED / GROWING / HARVESTED / CANCELLED)',
  })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @ApiPropertyOptional({
    example: 'Mùa vụ bưởi tết 2026 áp dụng quy trình VietGAP mới',
    description: 'Ghi chú thêm về vụ canh tác',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
