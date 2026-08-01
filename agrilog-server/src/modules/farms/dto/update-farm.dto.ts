import { PartialType } from '@nestjs/swagger';
import { CreateFarmDto } from './create-farm.dto';
import { IUpdateFarmDto } from 'agrilog-shared';

export class UpdateFarmDto extends PartialType(CreateFarmDto) implements IUpdateFarmDto {}
