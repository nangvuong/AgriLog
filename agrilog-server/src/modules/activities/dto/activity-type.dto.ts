import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  IActivityTypeDto,
  ICreateActivityTypeDto,
  IUpdateActivityTypeDto,
} from 'agrilog-shared';

export class CreateActivityTypeDto implements ICreateActivityTypeDto {
  @ApiProperty({
    example: 'FERTILIZE',
    description: 'Mã loại hoạt động (viết hoa, không dấu)',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'Bón phân',
    description: 'Tên loại hoạt động canh tác',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Bón lót, bón thúc định kỳ bằng phân hữu cơ hoặc NPK',
    description: 'Mô tả chi tiết hoạt động',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateActivityTypeDto implements IUpdateActivityTypeDto {
  @ApiPropertyOptional({ example: 'FERTILIZE', description: 'Mã loại hoạt động' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Bón phân', description: 'Tên loại hoạt động canh tác' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Bón lót, bón thúc định kỳ',
    description: 'Mô tả chi tiết',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ActivityTypeResponseDto implements IActivityTypeDto {
  @ApiProperty({ example: 1, description: 'ID loại hoạt động' })
  id!: number;

  @ApiProperty({ example: 'FERTILIZE', description: 'Mã loại hoạt động' })
  code!: string;

  @ApiProperty({ example: 'Bón phân', description: 'Tên loại hoạt động' })
  name!: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  description?: string;
}
