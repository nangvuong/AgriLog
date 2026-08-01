import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ICreateCropDto } from 'agrilog-shared';

export class CreateCropDto implements ICreateCropDto {
  @ApiProperty({
    example: 'Bưởi',
    description: 'Tên loại cây trồng nông nghiệp (độc nhất)',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'Citrus maxima',
    description: 'Tên khoa học của cây trồng',
  })
  @IsOptional()
  @IsString()
  scientific_name?: string;

  @ApiPropertyOptional({
    example: 'Cây ăn quả',
    description: 'Phân loại nhóm cây trồng (Cây ăn quả, Cây công nghiệp, Cây lương thực...)',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Cây có múi nhiệt đới lâu năm, ưa đất phù sa ngọt',
    description: 'Mô tả chi tiết về đặc điểm loại cây trồng',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
