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

      this.logger.log('Synchronizing PostgreSQL serial ID sequences...');
      const queryRunner = this.databaseService.getDataSource().createQueryRunner();
      await queryRunner.connect();
      try {
        const sequences = await queryRunner.query(`
          SELECT c.relname AS seq_name,
                 t.relname AS table_name
          FROM pg_class c
          JOIN pg_depend d ON d.objid = c.oid
          JOIN pg_class t ON d.refobjid = t.oid
          JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
          WHERE c.relkind = 'S' AND a.attname = 'id';
        `);

        for (const { seq_name, table_name } of sequences) {
          try {
            await queryRunner.query(`
              SELECT setval('${seq_name}', COALESCE((SELECT MAX(id) FROM "${table_name}"), 1));
            `);
          } catch (seqError: any) {
            this.logger.warn(`Could not sync sequence ${seq_name} for table ${table_name}: ${seqError.message}`);
          }
        }
        this.logger.log('PostgreSQL ID sequences synchronized.');
      } finally {
        await queryRunner.release();
      }
    } catch (error: any) {
      this.logger.error(`Database seed execution failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
