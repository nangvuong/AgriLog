import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropVarietyEntity } from './crop-variety.entity';
import { CropVarietiesService } from './crop-varieties.service';
import { CropVarietiesController } from './crop-varieties.controller';
import { CropsModule } from '../crops/crops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CropVarietyEntity]),
    CropsModule,
  ],
  controllers: [CropVarietiesController],
  providers: [CropVarietiesService],
  exports: [CropVarietiesService, TypeOrmModule],
})
export class CropVarietiesModule {}
