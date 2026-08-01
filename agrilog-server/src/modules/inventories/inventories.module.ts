import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './inventory.entity';
import { FarmEntity } from '../farms/farm.entity';
import { MaterialEntity } from '../materials/material.entity';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity, FarmEntity, MaterialEntity]),
  ],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [InventoriesService],
})
export class InventoriesModule {}
