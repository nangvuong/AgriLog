import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ICreateFarmDto } from 'agrilog-shared';

export class CreateFarmDto implements ICreateFarmDto {
  @ApiProperty({
    example: 'Trang trại Bưởi Da Xanh Bến Tre',
    description: 'Tên trang trại nông nghiệp',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID của nông dân sở hữu trang trại (chủ trại)',
  })
  @IsOptional()
  @IsNumber()
  owner_farmer_id?: number;

  @ApiPropertyOptional({
    example: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
    description: 'Địa chỉ chi tiết của trang trại',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 10.254112,
    description: 'Vĩ độ GPS của trang trại (-90 đến 90)',
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    example: 106.312541,
    description: 'Kinh độ GPS của trang trại (-180 đến 180)',
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Trang trại chuyên canh bưởi da xanh đạt chuẩn VietGAP',
    description: 'Mô tả chi tiết về trang trại',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
