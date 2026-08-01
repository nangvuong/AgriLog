import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { AiStatus, IActivityQueryDto, SourceType } from 'agrilog-shared';

export class ActivityQueryDto
  extends PaginationQueryDto
  implements IActivityQueryDto
{
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc hoạt động theo ID vụ mùa (seasonId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seasonId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc hoạt động theo ID người nông dân (farmerId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmerId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc hoạt động theo ID loại hoạt động (activityTypeId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activityTypeId?: number;

  @ApiPropertyOptional({
    enum: SourceType,
    description: 'Lọc theo nguồn ghi nhận (VOICE, TEXT, IMAGE, MANUAL)',
  })
  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @ApiPropertyOptional({
    enum: AiStatus,
    description: 'Lọc theo trạng thái xử lý AI',
  })
  @IsOptional()
  @IsEnum(AiStatus)
  aiStatus?: AiStatus;
}
