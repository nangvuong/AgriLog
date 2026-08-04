import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActivityEntity,
  ActivityTypeEntity,
  FarmerEntity,
  ActivityMaterialEntity,
  ActivityAssetEntity,
  ActivityAiExtractionEntity,
  ActivityMediaEntity,
} from './entities';
import { SeasonEntity } from '../seasons/season.entity';
import { MaterialEntity } from '../materials/material.entity';
import { AssetEntity } from '../assets/asset.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { ActivityTypesController } from './activity-types.controller';
import {
  ObservationsModule,
  ObservationEntity,
} from '../observations';
import {
  HarvestsModule,
  HarvestEntity,
} from '../harvests';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityTypeEntity,
      FarmerEntity,
      SeasonEntity,
      ActivityMaterialEntity,
      ActivityAssetEntity,
      ActivityAiExtractionEntity,
      ActivityMediaEntity,
      MaterialEntity,
      AssetEntity,
      ObservationEntity,
      HarvestEntity,
    ]),
    ObservationsModule,
    HarvestsModule,
    StorageModule,
  ],
  controllers: [ActivitiesController, ActivityTypesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
