import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ICreateAssetDto, AssetStatus } from 'agrilog-shared';

export class CreateAssetDto implements ICreateAssetDto {
  @ApiProperty({
    example: 1,
    description: 'ID của trang trại sở hữu máy móc / tài sản này',
  })
  @IsNotEmpty()
  @IsNumber()
  farm_id!: number;

  @ApiProperty({
    example: 'Máy cày Kubota L4508',
    description: 'Tên tài sản / máy móc cơ giới / thiết bị nông nghiệp',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Máy cơ giới',
    description: 'Phân loại tài sản (Máy cơ giới, Hệ thống tưới, Drone, Nhà màng...)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 'KUB-L4508-VN2024',
    description: 'Số sê-ri / Mã tài sản định danh thiết bị',
  })
  @IsOptional()
  @IsString()
  serial_number?: string;

  @ApiPropertyOptional({
    example: '2024-05-15',
    description: 'Ngày mua / đưa tài sản vào sử dụng (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  purchase_date?: string;

  @ApiPropertyOptional({
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
    description: 'Trạng thái hoạt động của tài sản (ACTIVE / MAINTENANCE / BROKEN / INACTIVE)',
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}
