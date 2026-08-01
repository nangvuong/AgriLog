import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  IHoatDongItemDto,
  IQuickFarmingLogDto,
  IVatTuItemDto,
} from 'agrilog-shared';

export class VatTuItemDto implements IVatTuItemDto {
  @ApiProperty({
    description: 'Tên vật tư nông nghiệp (VD: Regent 800WG, NPK 20-20-15)',
    example: 'Regent 800WG',
  })
  @IsString()
  ten_vat_tu!: string;

  @ApiProperty({
    description: 'Liều lượng / Số lượng (VD: 50ml, 2 bao, 100g)',
    example: '50ml',
  })
  @IsString()
  lieu_luong!: string;

  @ApiPropertyOptional({
    description: 'Loại vật tư (phan_bon, thuoc_bvtv, che_pham_sinh_hoc)',
    example: 'thuoc_bvtv',
  })
  @IsOptional()
  @IsString()
  loai_vat_tu?: string;
}

export class HoatDongItemDto implements IHoatDongItemDto {
  @ApiProperty({
    description: 'Loại hoạt động canh tác (phun_thuoc, bon_phan, tuoi_nuoc...)',
    example: 'phun_thuoc',
  })
  @IsString()
  loai_hoat_dong!: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn cho riêng hoạt động này',
    example: 'Phun trừ sâu vẽ bùa lộc non',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;

  @ApiPropertyOptional({
    description: 'Danh sách 1 hoặc nhiều vật tư sử dụng riêng cho hoạt động này',
    type: [VatTuItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VatTuItemDto)
  vat_tu_list?: VatTuItemDto[];
}

export class QuickFarmingLogDto implements IQuickFarmingLogDto {
  @ApiProperty({
    description: 'ID của vụ mùa / lô trồng đang canh tác',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  vu_mua_id!: number;

  @ApiProperty({
    description:
      'Danh sách các hoạt động canh tác, trong đó MỖI HOẠT ĐỘNG CHỨA 1 HOẶC NHIỀU VẬT TƯ tương ứng',
    type: [HoatDongItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoatDongItemDto)
  hoat_dong_list!: HoatDongItemDto[];

  @ApiPropertyOptional({
    description: 'Loại hoạt động canh tác chính (tùy chọn)',
    example: 'phun_thuoc',
  })
  @IsOptional()
  @IsString()
  loai_hoat_dong?: string;

  @ApiPropertyOptional({
    description: 'Tọa độ GPS / Địa điểm ghi nhận',
    example: '10.3751° N, 105.4321° E',
  })
  @IsOptional()
  @IsString()
  vi_tri_gps?: string;

  @ApiPropertyOptional({
    description: 'Ngày thực hiện (ISO string hoặc YYYY-MM-DD, mặc định hôm nay)',
    example: '2026-07-30',
  })
  @IsOptional()
  @IsString()
  ngay_thuc_hien?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú công việc / mô tả tổng hợp',
    example: 'Phun thuốc sâu rầy sinh học & Bón phân lá cho Lô A2',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;

  @ApiPropertyOptional({
    description: 'Danh sách URL hình ảnh đính kèm minh chứng',
    type: [String],
    example: ['https://agrilog.vn/uploads/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hinh_anh?: string[];
}
