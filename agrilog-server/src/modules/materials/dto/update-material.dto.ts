import { PartialType } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';
import { IUpdateMaterialDto } from 'agrilog-shared';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) implements IUpdateMaterialDto {}
