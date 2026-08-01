import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { PlotStatus } from 'agrilog-shared';

export class PlotQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc lô canh tác theo ID trang trại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmId?: number;

  @ApiPropertyOptional({ enum: PlotStatus, description: 'Lọc theo trạng thái lô đất' })
  @IsOptional()
  @IsEnum(PlotStatus)
  status?: PlotStatus;
}
