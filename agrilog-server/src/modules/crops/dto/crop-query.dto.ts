import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBooleanString } from 'class-validator';
import { PaginationQueryDto } from '../../../common';

export class CropQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Bật true để tính tổng số lượng giống cây con' })
  @IsOptional()
  @IsBooleanString()
  summary?: string;
}
