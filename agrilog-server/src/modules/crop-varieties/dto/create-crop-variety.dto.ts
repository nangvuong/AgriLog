import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ICreateCropVarietyDto } from 'agrilog-shared';

export class CreateCropVarietyDto implements ICreateCropVarietyDto {
  @ApiProperty({
    example: 1,
    description: 'ID của loại cây trồng (Crop ID)',
  })
  @IsNotEmpty()
  @IsNumber()
  crop_id!: number;

  @ApiProperty({
    example: 'Da Xanh Bến Tre',
    description: 'Tên giống cây trồng (duy nhất trong cùng loại cây trồng)',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Trung tâm Giống Cây trồng Miền Nam',
    description: 'Nhà cung cấp giống hoặc cơ sở nhân giống',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    example: 'Giống bưởi da xanh ruột hồng, vị ngọt thanh, kháng bệnh tốt',
    description: 'Mô tả đặc trưng sinh học và nông học của giống',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
