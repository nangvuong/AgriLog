import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISeasonDto, SeasonStatus } from 'agrilog-shared';

export class SeasonResponseDto implements ISeasonDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  plot_id!: number;

  @ApiProperty({ example: 1 })
  crop_variety_id!: number;

  @ApiProperty({ example: '2026-02-01' })
  planting_date!: string | Date;

  @ApiPropertyOptional({ example: '2026-10-15' })
  expected_harvest_date?: string | Date | null;

  @ApiPropertyOptional({ example: '2026-10-12' })
  actual_harvest_date?: string | Date | null;

  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.PLANNED })
  status!: SeasonStatus;

  @ApiPropertyOptional({ example: 'Mùa vụ bưởi tết 2026' })
  note?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiPropertyOptional({ example: 'PLOT_A01', description: 'Mã lô/vườn' })
  plot_code?: string;

  @ApiPropertyOptional({ example: 'Vườn Sầu Riêng Ri6', description: 'Tên lô/vườn' })
  plot_name?: string;

  @ApiPropertyOptional({ example: 'Sầu riêng', description: 'Tên loại cây trồng' })
  crop_name?: string;

  @ApiPropertyOptional({ example: 'Ri6 Bến Tre', description: 'Tên giống cây trồng' })
  crop_variety_name?: string;
}
