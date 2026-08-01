import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { DatabaseService } from '../database.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Thực thi seed dữ liệu mẫu cho hệ thống AgriLog đa cây trồng
   * Đọc từ file agrilog_seed.sql ở gốc dự án hoặc thực hiện seed lập trình
   */
  async run(): Promise<void> {
    this.logger.log('Starting database seed execution...');
    const seedFilePath = path.resolve(process.cwd(), '../agrilog_seed.sql');

    try {
      await this.databaseService.executeSqlFile(seedFilePath);
      this.logger.log('Database seed execution completed successfully.');
    } catch (error: any) {
      this.logger.error(`Database seed execution failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
