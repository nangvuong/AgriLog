import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICropVarietyDto } from 'agrilog-shared';

export class CropVarietyResponseDto implements ICropVarietyDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  crop_id!: number;

  @ApiProperty({ example: 'Da Xanh Bến Tre' })
  name!: string;

  @ApiPropertyOptional({ example: 'Trung tâm Giống Cây trồng Miền Nam' })
  supplier?: string;

  @ApiPropertyOptional({ example: 'Giống bưởi da xanh ruột hồng, vị ngọt thanh' })
  description?: string;

  @ApiPropertyOptional({ example: 'Bưởi', description: 'Tên loại cây trồng chính' })
  crop_name?: string;
}
