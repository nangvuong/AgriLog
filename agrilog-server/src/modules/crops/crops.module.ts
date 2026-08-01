import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropEntity } from './crop.entity';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CropEntity])],
  controllers: [CropsController],
  providers: [CropsService],
  exports: [CropsService, TypeOrmModule],
})
export class CropsModule {}
