import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ICreatePlotDto, PlotStatus, IPlotGeoJson } from 'agrilog-shared';

export class CreatePlotDto implements ICreatePlotDto {
  @ApiProperty({
    example: 1,
    description: 'ID của trang trại mà lô/vườn thuộc về',
  })
  @IsNotEmpty()
  @IsNumber()
  farm_id!: number;

  @ApiProperty({
    example: 'PLOT_B01',
    description: 'Mã lô/vườn đất canh tác (duy nhất trong trang trại)',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({
    example: 'Vườn Bưởi Khu A',
    description: 'Tên gọi của lô/vườn đất',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 2.5,
    description: 'Diện tích canh tác (đơn vị: hecta hoặc m2, phải >= 0)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Diện tích không được số âm' })
  area!: number;

  @ApiPropertyOptional({
    example: 'Đất phù sa ngọt cổ',
    description: 'Đặc tính loại đất',
  })
  @IsOptional()
  @IsString()
  soil_type?: string;

  @ApiPropertyOptional({
    enum: PlotStatus,
    default: PlotStatus.ACTIVE,
    description: 'Trạng thái canh tác của lô đất (ACTIVE / FALLOW / INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlotStatus)
  status?: PlotStatus;

  @ApiPropertyOptional({
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [106.312, 10.254],
          [106.313, 10.254],
          [106.313, 10.255],
          [106.312, 10.255],
          [106.312, 10.254],
        ],
      ],
    },
    description: 'Dữ liệu không gian GeoJSON Polygon mô tả ranh giới lô đất (PostGIS SRID 4326)',
  })
  @IsOptional()
  polygon?: IPlotGeoJson | null;
}
