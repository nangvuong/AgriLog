import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { RedisModule } from './redis';
import {
  AuthModule,
  UsersModule,
  FarmsModule,
  PlotsModule,
  CropsModule,
  CropVarietiesModule,
  MaterialsModule,
  AssetsModule,
  SeasonsModule,
  ActivitiesModule,
  ObservationsModule,
  InventoriesModule,
  HarvestsModule,
  StorageModule,
} from './modules';
import { databaseConfig, redisConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    DatabaseModule,
    RedisModule,
    UsersModule,
    AuthModule,
    FarmsModule,
    PlotsModule,
    CropsModule,
    CropVarietiesModule,
    MaterialsModule,
    AssetsModule,
    SeasonsModule,
    ActivitiesModule,
    ObservationsModule,
    InventoriesModule,
    HarvestsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}