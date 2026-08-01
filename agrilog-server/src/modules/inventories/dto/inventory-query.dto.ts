import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { IInventoryQueryDto } from 'agrilog-shared';

export class InventoryQueryDto
  extends PaginationQueryDto
  implements IInventoryQueryDto
{
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc tồn kho theo ID trang trại (farmId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc tồn kho theo ID vật tư (materialId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  materialId?: number;
}
