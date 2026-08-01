import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';
import { IUpdateAssetDto } from 'agrilog-shared';

export class UpdateAssetDto
  extends PartialType(OmitType(CreateAssetDto, ['farm_id'] as const))
  implements IUpdateAssetDto {}
