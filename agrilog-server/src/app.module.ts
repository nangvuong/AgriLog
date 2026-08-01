import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FarmerDashboardModule } from './farmer-dashboard/farmer-dashboard.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, FarmerDashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}