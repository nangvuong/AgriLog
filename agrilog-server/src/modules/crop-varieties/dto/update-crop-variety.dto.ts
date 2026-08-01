import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCropVarietyDto } from './create-crop-variety.dto';
import { IUpdateCropVarietyDto } from 'agrilog-shared';

export class UpdateCropVarietyDto
  extends PartialType(OmitType(CreateCropVarietyDto, ['crop_id'] as const))
  implements IUpdateCropVarietyDto {}
