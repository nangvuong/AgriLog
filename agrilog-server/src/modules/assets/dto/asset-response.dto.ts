import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IAssetDto, AssetStatus } from 'agrilog-shared';

export class AssetResponseDto implements IAssetDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  farm_id!: number;

  @ApiProperty({ example: 'Máy cày Kubota L4508' })
  name!: string;

  @ApiPropertyOptional({ example: 'Máy cơ giới' })
  type?: string;

  @ApiPropertyOptional({ example: 'KUB-L4508-VN2024' })
  serial_number?: string;

  @ApiPropertyOptional({ example: '2024-05-15' })
  purchase_date?: string | Date | null;

  @ApiProperty({ enum: AssetStatus, example: AssetStatus.ACTIVE })
  status!: AssetStatus;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiPropertyOptional({ example: 'Trang trại Phú An', description: 'Tên trang trại sở hữu' })
  farm_name?: string;
}
