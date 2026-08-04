import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AiStatus,
  IActivityDto,
  IActivityAiExtractionDto,
  ICreateActivityDto,
  ICreateActivityAiExtractionDto,
  IUpdateActivityDto,
  SourceType,
} from 'agrilog-shared';
import {
  ActivityAssetResponseDto,
  ActivityMaterialResponseDto,
  ActivityMediaResponseDto,
  CreateActivityAssetDto,
  CreateActivityMaterialDto,
  CreateActivityMediaDto,
} from './activity-resources.dto';
import {
  CreateObservationDto,
  ObservationResponseDto,
} from '../../observations/dto';
import {
  CreateHarvestDto,
  HarvestResponseDto,
} from '../../harvests/dto';

export class CreateActivityAiExtractionDto implements ICreateActivityAiExtractionDto {
  @ApiProperty({ example: 'gemini-2.5-pro', description: 'Tên model AI' })
  @IsNotEmpty()
  @IsString()
  model_name!: string;

  @ApiPropertyOptional({ example: 'gemini-2.5-pro', description: 'Alias cho tên model AI' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'v1.0', description: 'Phiên bản prompt' })
  @IsOptional()
  @IsString()
  prompt_version?: string;

  @ApiPropertyOptional({ description: 'Văn bản đầu vào cho AI trích xuất' })
  @IsOptional()
  @IsString()
  input_text?: string;

  @ApiPropertyOptional({ description: 'Văn bản đầu vào (alias)' })
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu JSON đầu ra từ AI' })
  @IsOptional()
  output_json?: any;

  @ApiPropertyOptional({ description: 'Dữ liệu JSON đầu ra (alias)' })
  @IsOptional()
  output?: any;

  @ApiPropertyOptional({ example: 0.95, description: 'Độ tin cậy của AI (0-1)' })
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiPropertyOptional({ example: 450, description: 'Thời gian xử lý (ms)' })
  @IsOptional()
  @IsInt()
  processing_time_ms?: number;

  @ApiPropertyOptional({ example: 0.45, description: 'Thời gian xử lý (giây)' })
  @IsOptional()
  @IsNumber()
  processing_time?: number;
}

export class ActivityAiExtractionResponseDto implements IActivityAiExtractionDto {
  @ApiProperty({ example: 1, description: 'ID' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID hoạt động' })
  activity_id!: number;

  @ApiProperty({ example: 'gemini-2.5-pro', description: 'Tên model AI' })
  model_name!: string;

  @ApiPropertyOptional({ example: 'v1.0', description: 'Phiên bản prompt' })
  prompt_version?: string;

  @ApiPropertyOptional({ description: 'Văn bản đầu vào cho AI trích xuất' })
  input_text?: string;

  @ApiPropertyOptional({ description: 'Dữ liệu JSON đầu ra từ AI' })
  output_json?: any;

  @ApiPropertyOptional({ example: 0.95, description: 'Độ tin cậy của AI' })
  confidence?: number;

  @ApiPropertyOptional({ example: 450, description: 'Thời gian xử lý (ms)' })
  processing_time_ms?: number;

  @ApiProperty({ description: 'Thời gian tạo' })
  created_at!: string | Date;
}

export class CreateActivityDto implements ICreateActivityDto {
  @ApiPropertyOptional({ example: 1, description: 'ID vụ mùa (Season)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  season_id?: number;

  @ApiPropertyOptional({ example: 'A1', description: 'Mã thửa đất (Plot code)' })
  @IsOptional()
  @IsString()
  plot_code?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID người nông dân thực hiện' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmer_id?: number;

  @ApiPropertyOptional({ example: 'Ông Ba', description: 'Họ tên nông dân' })
  @IsOptional()
  @IsString()
  farmer_name?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID loại hoạt động canh tác (ActivityType)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_type_id?: number;

  @ApiPropertyOptional({ example: 'FERTILIZE', description: 'Mã loại hoạt động canh tác' })
  @IsOptional()
  @IsString()
  activity_type_code?: string;

  @ApiPropertyOptional({ example: 'FERTILIZE', description: 'Mã loại hoạt động canh tác (alias)' })
  @IsOptional()
  @IsString()
  activity_type?: string;

  @ApiPropertyOptional({
    example: 'Bón lót phân hữu cơ vi sinh Đầu Trâu đầu vụ cho Lô A',
    description: 'Mô tả hoạt động canh tác',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Bón quanh tán cây, kết hợp xới nhẹ mặt đất',
    description: 'Ghi chú thêm',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    example: '2026-08-01T07:30:00Z',
    description: 'Thời gian bắt đầu hoạt động (ISO Date)',
  })
  @IsNotEmpty()
  @IsDateString()
  start_time!: string | Date;

  @ApiPropertyOptional({
    example: '2026-08-01T10:00:00Z',
    description: 'Thời gian kết thúc hoạt động (ISO Date)',
  })
  @IsOptional()
  @IsDateString()
  end_time?: string | Date;

  @ApiPropertyOptional({ example: 10.29845, description: 'Vĩ độ điểm ghi nhận' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.3421, description: 'Kinh độ điểm ghi nhận' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    enum: SourceType,
    example: SourceType.MANUAL,
    description: 'Nguồn ghi nhận dữ liệu (VOICE, TEXT, IMAGE, MANUAL)',
    default: SourceType.MANUAL,
  })
  @IsOptional()
  @IsEnum(SourceType)
  source_type?: SourceType = SourceType.MANUAL;

  @ApiPropertyOptional({
    enum: AiStatus,
    example: AiStatus.CONFIRMED,
    description: 'Trạng thái xử lý AI (nếu ghi từ VOICE/IMAGE)',
  })
  @IsOptional()
  @IsEnum(AiStatus)
  ai_status?: AiStatus;

  @ApiPropertyOptional({
    type: [CreateActivityMaterialDto],
    description: 'Danh sách vật tư sử dụng trong hoạt động',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityMaterialDto)
  materials?: CreateActivityMaterialDto[];

  @ApiPropertyOptional({
    type: [CreateActivityAssetDto],
    description: 'Danh sách máy móc/thiết bị sử dụng trong hoạt động',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityAssetDto)
  assets?: CreateActivityAssetDto[];

  @ApiPropertyOptional({
    type: [CreateObservationDto],
    description: 'Danh sách quan sát/sâu bệnh ghi nhận trong hoạt động',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObservationDto)
  observations?: CreateObservationDto[];

  @ApiPropertyOptional({
    type: [CreateHarvestDto],
    description: 'Danh sách thu hoạch ghi nhận trong hoạt động',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHarvestDto)
  harvests?: CreateHarvestDto[];

  @ApiPropertyOptional({
    type: [CreateActivityMediaDto],
    description: 'Danh sách media (ảnh/video/audio) đính kèm hoạt động',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityMediaDto)
  media?: CreateActivityMediaDto[];

  @ApiPropertyOptional({
    type: CreateActivityAiExtractionDto,
    description: 'Thông tin metadata AI trích xuất (model, input, output, thời gian xử lý)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateActivityAiExtractionDto)
  ai_extraction?: CreateActivityAiExtractionDto;
}

export class UpdateActivityDto implements IUpdateActivityDto {
  @ApiPropertyOptional({ example: 1, description: 'ID vụ mùa (Season)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  season_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID người nông dân thực hiện' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  farmer_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID loại hoạt động canh tác' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_type_id?: number;

  @ApiPropertyOptional({ description: 'Mô tả hoạt động canh tác' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu (ISO Date)' })
  @IsOptional()
  @IsDateString()
  start_time?: string | Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc (ISO Date)' })
  @IsOptional()
  @IsDateString()
  end_time?: string | Date;

  @ApiPropertyOptional({ description: 'Vĩ độ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: SourceType, description: 'Nguồn ghi nhận' })
  @IsOptional()
  @IsEnum(SourceType)
  source_type?: SourceType;

  @ApiPropertyOptional({ enum: AiStatus, description: 'Trạng thái AI' })
  @IsOptional()
  @IsEnum(AiStatus)
  ai_status?: AiStatus;

  @ApiPropertyOptional({
    type: [CreateActivityMaterialDto],
    description: 'Danh sách vật tư cập nhật sử dụng',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityMaterialDto)
  materials?: CreateActivityMaterialDto[];

  @ApiPropertyOptional({
    type: [CreateActivityAssetDto],
    description: 'Danh sách máy móc/thiết bị cập nhật sử dụng',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityAssetDto)
  assets?: CreateActivityAssetDto[];

  @ApiPropertyOptional({
    type: [CreateObservationDto],
    description: 'Danh sách quan sát/sâu bệnh cập nhật',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObservationDto)
  observations?: CreateObservationDto[];

  @ApiPropertyOptional({
    type: [CreateHarvestDto],
    description: 'Danh sách thu hoạch cập nhật',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHarvestDto)
  harvests?: CreateHarvestDto[];

  @ApiPropertyOptional({
    type: [CreateActivityMediaDto],
    description: 'Danh sách media (ảnh/video/audio) cập nhật',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityMediaDto)
  media?: CreateActivityMediaDto[];
}

export class ActivityResponseDto implements IActivityDto {
  @ApiProperty({ example: 1, description: 'ID nhật ký hoạt động' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID vụ mùa' })
  season_id!: number;

  @ApiProperty({ example: 1, description: 'ID nông dân' })
  farmer_id!: number;

  @ApiProperty({ example: 1, description: 'ID loại hoạt động' })
  activity_type_id!: number;

  @ApiPropertyOptional({ description: 'Mô tả hoạt động' })
  description?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  note?: string;

  @ApiProperty({ description: 'Thời gian bắt đầu' })
  start_time!: string | Date;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc' })
  end_time?: string | Date | null;

  @ApiPropertyOptional({ description: 'Vĩ độ' })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ' })
  longitude?: number;

  @ApiProperty({ enum: SourceType, description: 'Nguồn ghi nhận dữ liệu' })
  source_type!: SourceType;

  @ApiPropertyOptional({ enum: AiStatus, description: 'Trạng thái xử lý AI' })
  ai_status?: AiStatus | null;

  @ApiProperty({ description: 'Thời gian tạo' })
  created_at!: string | Date;

  @ApiProperty({ description: 'Thời gian cập nhật gần nhất' })
  updated_at!: string | Date;

  @ApiPropertyOptional({ example: 'Vụ Xuân Hè 2026', description: 'Tên/mô tả vụ mùa' })
  season_name?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID thửa đất / lô canh tác' })
  plot_id?: number;

  @ApiPropertyOptional({ example: 'A1', description: 'Mã thửa đất' })
  plot_code?: string;

  @ApiPropertyOptional({ example: 'Ruộng trước nhà', description: 'Tên thửa đất' })
  plot_name?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Họ tên nông dân thực hiện' })
  farmer_name?: string;

  @ApiPropertyOptional({ example: 'FERTILIZE', description: 'Mã loại hoạt động' })
  activity_type_code?: string;

  @ApiPropertyOptional({ example: 'Bón phân', description: 'Tên loại hoạt động' })
  activity_type_name?: string;

  @ApiPropertyOptional({
    type: [ActivityMaterialResponseDto],
    description: 'Danh sách vật tư sử dụng trong hoạt động',
  })
  materials?: ActivityMaterialResponseDto[];

  @ApiPropertyOptional({
    type: [ActivityAssetResponseDto],
    description: 'Danh sách máy móc / thiết bị sử dụng trong hoạt động',
  })
  assets?: ActivityAssetResponseDto[];

  @ApiPropertyOptional({
    type: [ObservationResponseDto],
    description: 'Danh sách quan sát / sâu bệnh ghi nhận trong hoạt động',
  })
  observations?: ObservationResponseDto[];

  @ApiPropertyOptional({
    type: [HarvestResponseDto],
    description: 'Danh sách thu hoạch nông sản trong hoạt động',
  })
  harvests?: HarvestResponseDto[];

  @ApiPropertyOptional({
    type: [ActivityMediaResponseDto],
    description: 'Danh sách media (ảnh/video/audio) đính kèm',
  })
  media?: ActivityMediaResponseDto[];

  @ApiPropertyOptional({
    type: ActivityAiExtractionResponseDto,
    description: 'Thông tin AI trích xuất (model, input, output, thời gian xử lý)',
  })
  ai_extraction?: ActivityAiExtractionResponseDto;
}
