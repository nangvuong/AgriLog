import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBooleanString } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { IFarmQueryDto } from 'agrilog-shared';

export class FarmQueryDto
  extends PaginationQueryDto
  implements IFarmQueryDto
{
  @ApiPropertyOptional({
    description: 'Bật true để trả về thông tin tổng hợp (số lô, tổng diện tích)',
  })
  @IsOptional()
  @IsBooleanString()
  summary?: string;
}
