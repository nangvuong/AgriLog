import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HarvestEntity } from './harvest.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';

@Module({
  imports: [TypeOrmModule.forFeature([HarvestEntity, ActivityEntity])],
  controllers: [HarvestsController],
  providers: [HarvestsService],
  exports: [HarvestsService, TypeOrmModule],
})
export class HarvestsModule {}
