import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlotEntity } from './plot.entity';
import { PlotsService } from './plots.service';
import { PlotsController } from './plots.controller';
import { FarmsModule } from '../farms/farms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlotEntity]),
    FarmsModule,
  ],
  controllers: [PlotsController],
  providers: [PlotsService],
  exports: [PlotsService, TypeOrmModule],
})
export class PlotsModule {}
