import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonEntity } from './season.entity';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { PlotsModule } from '../plots/plots.module';
import { CropVarietiesModule } from '../crop-varieties/crop-varieties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeasonEntity]),
    PlotsModule,
    CropVarietiesModule,
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}
