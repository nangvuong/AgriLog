import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmEntity } from './farm.entity';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FarmEntity])],
  controllers: [FarmsController],
  providers: [FarmsService],
  exports: [FarmsService, TypeOrmModule],
})
export class FarmsModule {}
