import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationEntity } from './observation.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObservationEntity, ActivityEntity]),
  ],
  controllers: [ObservationsController],
  providers: [ObservationsService],
  exports: [ObservationsService],
})
export class ObservationsModule {}
