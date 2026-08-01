import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { IMaterialQueryDto } from 'agrilog-shared';

export class MaterialQueryDto
  extends PaginationQueryDto
  implements IMaterialQueryDto
{
  @ApiPropertyOptional({ description: 'Lọc vật tư theo danh mục (category)' })
  @IsOptional()
  @IsString()
  category?: string;
}
