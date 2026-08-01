import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEntity } from './material.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialEntity])],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService, TypeOrmModule],
})
export class MaterialsModule {}
