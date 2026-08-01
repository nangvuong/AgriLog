import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { IPaginatedResponse, IPaginationMeta, IPaginationQuery } from 'agrilog-shared';

export class PaginationQueryDto implements IPaginationQuery {
  @ApiPropertyOptional({
    example: 1,
    description: 'Số thứ tự trang (mặc định: 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Số mục trên một trang (mặc định: 10, tối đa: 100)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationMetaDto implements IPaginationMeta {
  @ApiProperty({ example: 10, description: 'Số mục hiện có trên trang' })
  itemCount!: number;

  @ApiProperty({ example: 45, description: 'Tổng số mục trong toàn hệ thống/bộ lọc' })
  totalItems!: number;

  @ApiProperty({ example: 10, description: 'Số mục trên mỗi trang (limit)' })
  itemsPerPage!: number;

  @ApiProperty({ example: 5, description: 'Tổng số trang' })
  totalPages!: number;

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  currentPage!: number;
}
