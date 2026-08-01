import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common';

export class CropVarietyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc giống cây theo ID loại cây trồng (cropId)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cropId?: number;
}
