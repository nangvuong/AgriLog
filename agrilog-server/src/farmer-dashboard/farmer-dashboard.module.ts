import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FarmerDashboardController } from './farmer-dashboard.controller';
import { FarmerDashboardService } from './farmer-dashboard.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FarmerDashboardController],
  providers: [FarmerDashboardService],
  exports: [FarmerDashboardService],
})
export class FarmerDashboardModule {}
