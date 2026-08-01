import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { SeedService } from './seed.service';
import databaseConfig from '../../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
  ],
  providers: [SeedService],
})
class SeedModule {}

/**
 * Script CLI độc lập để chạy Seed CSDL
 * Lệnh chạy: npm run db:seed
 */
async function bootstrap() {
  const logger = new Logger('SeedRunner');
  logger.log('Initializing Seed Runner context...');

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const seedService = app.get(SeedService);
    await seedService.run();
    logger.log('Seed executed successfully!');
  } catch (error: any) {
    logger.error('Failed to execute seed:', error.stack || error.message);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
