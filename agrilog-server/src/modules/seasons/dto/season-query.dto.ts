import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ISeasonFilterQuery, SeasonStatus } from 'agrilog-shared';
import { PaginationQueryDto } from '../../../common';

export class SeasonQueryDto extends PaginationQueryDto implements ISeasonFilterQuery {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc danh sách mùa vụ theo ID lô/vườn (Plot ID)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  plotId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc danh sách mùa vụ theo ID giống cây trồng (Crop Variety ID)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cropVarietyId?: number;

  @ApiPropertyOptional({
    enum: SeasonStatus,
    description: 'Lọc theo trạng thái mùa vụ (PLANNED, GROWING, HARVESTED, CANCELLED)',
  })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;
}
