import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common';
import { IObservationQueryDto, SeverityLevel } from 'agrilog-shared';

export class ObservationQueryDto
  extends PaginationQueryDto
  implements IObservationQueryDto
{
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc quan sát theo ID nhật ký canh tác (activityId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activityId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc quan sát theo ID mùa vụ (seasonId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seasonId?: number;

  @ApiPropertyOptional({
    enum: SeverityLevel,
    description: 'Lọc theo mức độ nghiêm trọng (LOW, MEDIUM, HIGH)',
  })
  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel;

  @ApiPropertyOptional({
    example: 'vàng lá',
    description: 'Tìm kiếm từ khóa trong triệu chứng hoặc mô tả',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
