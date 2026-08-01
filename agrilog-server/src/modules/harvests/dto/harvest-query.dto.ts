import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { IHarvestQueryDto } from 'agrilog-shared';

export class HarvestQueryDto
  extends PaginationQueryDto
  implements IHarvestQueryDto
{
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc thu hoạch theo ID nhật ký canh tác (activityId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activityId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc thu hoạch theo ID mùa vụ (seasonId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seasonId?: number;

  @ApiPropertyOptional({
    example: 'Loại 1',
    description: 'Lọc theo tiêu chuẩn chất lượng (quality)',
  })
  @IsOptional()
  @IsString()
  quality?: string;

  @ApiPropertyOptional({
    example: 'Công ty',
    description: 'Lọc theo tên thương lái / đối tác mua (buyer)',
  })
  @IsOptional()
  @IsString()
  buyer?: string;

  @ApiPropertyOptional({
    example: 'Bưởi',
    description: 'Tìm kiếm từ khóa trong buyer hoặc quality',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
