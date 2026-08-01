import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IMaterialDto } from 'agrilog-shared';

export class MaterialResponseDto implements IMaterialDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Phân bón NPK 20-20-15' })
  name!: string;

  @ApiPropertyOptional({ example: 'Phân bón' })
  category?: string;

  @ApiPropertyOptional({ example: 'Tổng Công ty Phân bón Bình Điền' })
  manufacturer?: string;

  @ApiPropertyOptional({ example: 'kg' })
  default_unit?: string;

  @ApiPropertyOptional({ example: 'Phân bón vô cơ đa lượng chất lượng cao' })
  description?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}
