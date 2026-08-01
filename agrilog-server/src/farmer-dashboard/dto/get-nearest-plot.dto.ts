import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetNearestPlotQueryDto {
  @ApiProperty({
    example: 10.3751,
    description: 'Vĩ độ (Latitude) hiện tại từ GPS thiết bị',
  })
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @ApiProperty({
    example: 105.4321,
    description: 'Kinh độ (Longitude) hiện tại từ GPS thiết bị',
  })
  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

export class NearestPlotDto {
  @ApiProperty({ example: 1, description: 'ID Lô đất' })
  id!: number;

  @ApiProperty({ example: 'A2', description: 'Mã lô đất' })
  ma_lo!: string;

  @ApiProperty({ example: 'Lô A2 · Da Xanh', description: 'Tên đầy đủ lô đất' })
  ten_lo!: string;

  @ApiProperty({ example: 'Da Xanh', description: 'Giống bưởi canh tác' })
  giong_buoi!: string;

  @ApiProperty({ example: 15.4, description: 'Khoảng cách tính theo mét' })
  distance_meters!: number;

  @ApiProperty({ example: 'Cách 15m', description: 'Chuỗi khoảng cách dễ đọc' })
  distance_text!: string;

  @ApiProperty({
    example: { lat: 10.3751, lng: 105.4321 },
    description: 'Tọa độ GPS trung tâm lô đất',
  })
  toa_do_gps!: {
    lat: number;
    lng: number;
  };

  @ApiPropertyOptional({ example: 1, description: 'ID Vụ mùa đang canh tác' })
  @IsOptional()
  vu_mua_id?: number;

  @ApiPropertyOptional({
    example: 'Đã tìm thấy lô A2 gần nhất cách 15m',
    description: 'Thông điệp phản hồi',
  })
  @IsOptional()
  message?: string;
}

export class ReverseGeocodeDto {
  @ApiProperty({ example: 10.3751, description: 'Vĩ độ' })
  lat!: number;

  @ApiProperty({ example: 105.4321, description: 'Kinh độ' })
  lng!: number;

  @ApiProperty({
    example: 'Ấp 2, Xã Chợ Gạo, Huyện Chợ Gạo, Tỉnh Tiền Giang',
    description: 'Địa chỉ hành chính đầy đủ',
  })
  formatted_address!: string;

  @ApiPropertyOptional({ example: 'Tiền Giang' })
  @IsOptional()
  tinh_thanh?: string;

  @ApiPropertyOptional({ example: 'Chợ Gạo' })
  @IsOptional()
  quan_huyen?: string;

  @ApiPropertyOptional({ example: 'Xã Chợ Gạo' })
  @IsOptional()
  phuong_xa?: string;

  @ApiPropertyOptional({ example: 'HTX Bưởi Da Xanh Thạnh Lợi' })
  @IsOptional()
  ten_vung_trong?: string;
}
