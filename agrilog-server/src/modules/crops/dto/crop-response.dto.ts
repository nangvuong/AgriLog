import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICropDto, ICropSummaryDto } from 'agrilog-shared';

export class CropResponseDto implements ICropDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Bưởi' })
  name!: string;

  @ApiPropertyOptional({ example: 'Citrus maxima' })
  scientific_name?: string;

  @ApiPropertyOptional({ example: 'Cây ăn quả' })
  category?: string;

  @ApiPropertyOptional({ example: 'Cây có múi nhiệt đới lâu năm' })
  description?: string;
}

export class CropSummaryResponseDto extends CropResponseDto implements ICropSummaryDto {
  @ApiProperty({ example: 3, description: 'Tổng số giống cây đăng ký trong loại cây trồng này' })
  variety_count?: number;
}
