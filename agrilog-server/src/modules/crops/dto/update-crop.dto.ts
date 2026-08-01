import { PartialType } from '@nestjs/swagger';
import { CreateCropDto } from './create-crop.dto';
import { IUpdateCropDto } from 'agrilog-shared';

export class UpdateCropDto extends PartialType(CreateCropDto) implements IUpdateCropDto {}
