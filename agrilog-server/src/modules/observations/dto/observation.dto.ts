import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ICreateObservationDto,
  IObservationDto,
  IUpdateObservationDto,
  SeverityLevel,
} from 'agrilog-shared';

export class CreateObservationDto implements ICreateObservationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID nhật ký canh tác (Activity) - tùy chọn khi gọi qua sub-resource /api/activities/:id/observations',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_id?: number;

  @ApiProperty({
    example: 'Lá xuất hiện đốm vàng và héo ngọn',
    description: 'Triệu chứng / biểu hiện quan sát thấy trên vườn bưởi',
  })
  @IsNotEmpty()
  @IsString()
  symptom!: string;

  @ApiPropertyOptional({
    enum: SeverityLevel,
    example: SeverityLevel.MEDIUM,
    description: 'Mức độ nghiêm trọng của biểu hiện (LOW, MEDIUM, HIGH)',
    default: SeverityLevel.LOW,
  })
  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel = SeverityLevel.LOW;

  @ApiPropertyOptional({
    example: 'Nghi ngờ bệnh vàng lá thối rễ, xuất hiện tập trung ở 5 cây Lô A',
    description: 'Mô tả chi tiết quan sát',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateObservationDto implements IUpdateObservationDto {
  @ApiPropertyOptional({ example: 1, description: 'ID nhật ký canh tác' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activity_id?: number;

  @ApiPropertyOptional({
    description: 'Triệu chứng / biểu hiện quan sát thấy',
  })
  @IsOptional()
  @IsString()
  symptom?: string;

  @ApiPropertyOptional({
    enum: SeverityLevel,
    description: 'Mức độ nghiêm trọng (LOW, MEDIUM, HIGH)',
  })
  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ObservationResponseDto implements IObservationDto {
  @ApiProperty({ example: 1, description: 'ID quan sát / ghi nhận biểu hiện' })
  id!: number;

  @ApiProperty({ example: 1, description: 'ID nhật ký canh tác' })
  activity_id!: number;

  @ApiProperty({ example: 'Lá xuất hiện đốm vàng', description: 'Triệu chứng' })
  symptom!: string;

  @ApiProperty({
    enum: SeverityLevel,
    description: 'Mức độ nghiêm trọng (LOW, MEDIUM, HIGH)',
  })
  severity!: SeverityLevel;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  description?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  created_at!: string | Date;

  @ApiPropertyOptional({
    example: 'Thăm vườn buổi sáng',
    description: 'Mô tả ngắn của hoạt động canh tác',
  })
  activity_description?: string;

  @ApiPropertyOptional({
    example: 'Vụ Bưởi Tết 2026',
    description: 'Tên mùa vụ liên quan',
  })
  season_name?: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Nông dân thực hiện',
  })
  farmer_name?: string;
}
