import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSeasonDto } from './create-season.dto';
import { IUpdateSeasonDto } from 'agrilog-shared';

export class UpdateSeasonDto
  extends PartialType(OmitType(CreateSeasonDto, ['plot_id', 'crop_variety_id'] as const))
  implements IUpdateSeasonDto {}
