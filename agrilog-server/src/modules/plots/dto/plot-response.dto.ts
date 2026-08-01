import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IPlotDto, PlotStatus, IPlotGeoJson } from 'agrilog-shared';

export class PlotResponseDto implements IPlotDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  farm_id!: number;

  @ApiProperty({ example: 'PLOT_B01' })
  code!: string;

  @ApiPropertyOptional({ example: 'Vườn Bưởi Khu A' })
  name?: string;

  @ApiProperty({ example: 2.5 })
  area!: number;

  @ApiPropertyOptional({ example: 'Đất phù sa ngọt cổ' })
  soil_type?: string;

  @ApiProperty({ enum: PlotStatus, example: PlotStatus.ACTIVE })
  status!: PlotStatus;

  @ApiPropertyOptional()
  polygon?: IPlotGeoJson | null;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}
