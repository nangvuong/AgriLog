import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IFarmDto, IFarmSummaryDto } from 'agrilog-shared';

export class FarmResponseDto implements IFarmDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Trang trại Bưởi Da Xanh Bến Tre' })
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  owner_farmer_id?: number | null;

  @ApiPropertyOptional({ example: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre' })
  address?: string;

  @ApiPropertyOptional({ example: 10.254112 })
  latitude?: number;

  @ApiPropertyOptional({ example: 106.312541 })
  longitude?: number;

  @ApiPropertyOptional({ example: 'Trang trại chuẩn GlobalGAP' })
  description?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}

export class FarmSummaryResponseDto extends FarmResponseDto implements IFarmSummaryDto {
  @ApiProperty({ example: 5, description: 'Tổng số lô/vườn canh tác trong trang trại' })
  plot_count?: number;

  @ApiProperty({ example: 12.5, description: 'Tổng diện tích canh tác (hecta)' })
  total_area?: number;
}
