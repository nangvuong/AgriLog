import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { AssetStatus, IAssetQueryDto } from 'agrilog-shared';

export class AssetQueryDto
  extends PaginationQueryDto
  implements IAssetQueryDto
{
  @ApiPropertyOptional({ description: 'Lọc tài sản theo ID trang trại (farmId)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmId?: number;

  @ApiPropertyOptional({ enum: AssetStatus, description: 'Lọc theo trạng thái tài sản' })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}
