import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePlotDto } from './create-plot.dto';
import { IUpdatePlotDto } from 'agrilog-shared';

export class UpdatePlotDto
  extends PartialType(OmitType(CreatePlotDto, ['farm_id'] as const))
  implements IUpdatePlotDto {}
