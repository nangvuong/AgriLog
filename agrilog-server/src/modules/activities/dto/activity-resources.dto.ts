import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  IActivityAssetDto,
  IActivityMaterialDto,
  IActivityMediaDto,
  ICreateActivityAssetDto,
  ICreateActivityMaterialDto,
  ICreateActivityMediaDto,
  MediaType,
} from 'agrilog-shared';

export class CreateActivityMaterialDto implements ICreateActivityMaterialDto {
  @ApiProperty({ example: 1, description: 'ID vật tư nông nghiệp (Material)' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  material_id!: number;

  @ApiProperty({ example: 120, description: 'Số lượng vật tư đã sử dụng' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính thực tế sử dụng' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class ActivityMaterialResponseDto implements IActivityMaterialDto {
  @ApiProperty({ example: 1, description: 'ID bản ghi sử dụng vật tư' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID nhật ký canh tác' })
  activity_id!: number;

  @ApiProperty({ example: 1, description: 'ID vật tư nông nghiệp' })
  material_id!: number;

  @ApiProperty({ example: 120, description: 'Số lượng đã sử dụng' })
  quantity!: number;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị tính sử dụng' })
  unit?: string;

  @ApiPropertyOptional({
    example: 'Phân hữu cơ vi sinh Đầu Trâu',
    description: 'Tên vật tư nông nghiệp',
  })
  material_name?: string;

  @ApiPropertyOptional({ example: 'kg', description: 'Đơn vị chuẩn của vật tư' })
  material_default_unit?: string;
}

export class CreateActivityAssetDto implements ICreateActivityAssetDto {
  @ApiProperty({ example: 2, description: 'ID máy móc / tài sản (Asset)' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  asset_id!: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Thời gian sử dụng máy móc trong hoạt động (phút)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  usage_duration?: number;
}

export class ActivityAssetResponseDto implements IActivityAssetDto {
  @ApiProperty({ example: 1, description: 'ID bản ghi sử dụng tài sản' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID nhật ký canh tác' })
  activity_id!: number;

  @ApiProperty({ example: 2, description: 'ID máy móc / tài sản' })
  asset_id!: number;

  @ApiPropertyOptional({ example: 120, description: 'Thời gian sử dụng (phút)' })
  usage_duration?: number;

  @ApiPropertyOptional({
    example: 'Máy phun thuốc đeo lưng Oshima',
    description: 'Tên máy móc / thiết bị',
  })
  asset_name?: string;

  @ApiPropertyOptional({ example: 'may_phun', description: 'Phân loại tài sản' })
  asset_type?: string;
}

export class CreateActivityMediaDto implements ICreateActivityMediaDto {
  @ApiProperty({
    enum: MediaType,
    example: MediaType.IMAGE,
    description: 'Loại media (IMAGE, AUDIO, VIDEO)',
  })
  @IsEnum(MediaType)
  media_type!: MediaType;

  @ApiPropertyOptional({ example: 'photo_123.jpg', description: 'Tên file' })
  @IsOptional()
  @IsString()
  file_name?: string;

  @ApiProperty({
    example: 'https://supabase.co/storage/v1/object/public/...',
    description: 'URL file media',
  })
  @IsNotEmpty()
  @IsString()
  file_url!: string;

  @ApiPropertyOptional({ description: 'URL ảnh thu nhỏ' })
  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @ApiPropertyOptional({ example: 'image/jpeg', description: 'MIME type' })
  @IsOptional()
  @IsString()
  mime_type?: string;

  @ApiPropertyOptional({ example: 102400, description: 'Dung lượng file (bytes)' })
  @IsOptional()
  @IsNumber()
  file_size?: number;

  @ApiPropertyOptional({ example: 60, description: 'Thời lượng (giây) nếu là audio/video' })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class ActivityMediaResponseDto implements IActivityMediaDto {
  @ApiProperty({ example: 1, description: 'ID media' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID hoạt động' })
  activity_id!: number;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  media_type!: MediaType;

  @ApiPropertyOptional()
  file_name?: string;

  @ApiProperty()
  file_url!: string;

  @ApiPropertyOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional()
  mime_type?: string;

  @ApiPropertyOptional()
  file_size?: number;

  @ApiPropertyOptional()
  duration?: number;

  @ApiProperty()
  created_at!: Date;
}

