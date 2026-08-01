import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { FarmsModule } from '../farms/farms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetEntity]),
    FarmsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService, TypeOrmModule],
})
export class AssetsModule {}
