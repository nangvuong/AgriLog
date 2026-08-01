import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Kiểm tra kết nối CSDL (Health check)
   */
  async checkHealth(): Promise<{ status: 'ok' | 'error'; message: string; latencyMs?: number }> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1 AS health_check');
      const latencyMs = Date.now() - startTime;
      return { status: 'ok', message: 'Connected to PostgreSQL database successfully', latencyMs };
    } catch (error: any) {
      this.logger.error(`Database health check failed: ${error.message}`, error.stack);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Thực thi câu lệnh SQL thuần (Raw SQL query)
   */
  async query<T = any>(sql: string, parameters?: any[]): Promise<T> {
    return this.dataSource.query(sql, parameters);
  }

  /**
   * Thực thi file SQL (Dùng cho việc Seed dữ liệu tự động hoặc kiểm thử)
   * @param sqlFilePath Đường dẫn tuyệt đối hoặc tương đối tới file SQL
   */
  async executeSqlFile(sqlFilePath: string): Promise<void> {
    const absolutePath = path.isAbsolute(sqlFilePath)
      ? sqlFilePath
      : path.resolve(process.cwd(), sqlFilePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`SQL file not found at path: ${absolutePath}`);
    }

    this.logger.log(`Executing SQL file: ${absolutePath}`);
    const sqlContent = fs.readFileSync(absolutePath, 'utf8');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.query(sqlContent);
      this.logger.log(`Successfully executed SQL file: ${absolutePath}`);
    } catch (error: any) {
      this.logger.error(`Error executing SQL file ${absolutePath}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
