import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from './database.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly db: DatabaseService) { }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log(
      'Kiểm tra, khởi tạo bảng (Schema) và Seed dữ liệu mẫu khi khởi động server...',
    );

    try {
      // 1. Kiểm tra kết nối tới cơ sở dữ liệu
      await this.db.query('SELECT 1;');

      // 2. Kiểm tra xem bảng vung_trong trong schema đã được tạo chưa
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'vung_trong'
        ) AS table_exists;
      `;
      const tableResult = await this.db.query(checkTableQuery);
      const tableExists = tableResult.rows[0]?.table_exists;

      // 3. Nếu bảng chưa tồn tại -> Thực thi file schema_nhat_ky_buoi.sql để tạo bảng
      if (!tableExists) {
        const schemaFilePath = path.join(
          process.cwd(),
          'database',
          'seeds',
          'schema_nhat_ky_buoi.sql',
        );

        if (!fs.existsSync(schemaFilePath)) {
          this.logger.error(
            `Không tìm thấy file schema tại: ${schemaFilePath}`,
          );
          return;
        }

        this.logger.log(
          `Bảng CSDL chưa tồn tại, tiến hành khởi tạo Schema từ file ${schemaFilePath}...`,
        );
        const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');

        await this.db.query(schemaSql);
        this.logger.log('Khởi tạo Schema (Bảng, Enum, Trigger, View) thành công!');
      }

      // 4. Kiểm tra xem đã có dữ liệu trong bảng vung_trong chưa
      const countResult = await this.db.query('SELECT COUNT(*) FROM vung_trong;');
      const count = parseInt(countResult.rows[0].count, 10);

      if (count > 0) {
        this.logger.log('CSDL đã có sẵn dữ liệu, bỏ qua bước Seed mẫu.');
        return;
      }

      // 5. Nếu chưa có dữ liệu -> Đọc file sql seed và thực thi
      const seedFilePath = path.join(
        process.cwd(),
        'database',
        'seeds',
        '02_sample_data.sql',
      );

      if (!fs.existsSync(seedFilePath)) {
        this.logger.warn(`Không tìm thấy file seed tại: ${seedFilePath}`);
        return;
      }

      this.logger.log(
        `CSDL chưa có dữ liệu, tiến hành Seed từ file ${seedFilePath}...`,
      );
      const seedSql = fs.readFileSync(seedFilePath, 'utf8');

      await this.db.query(seedSql);
      this.logger.log('Seed dữ liệu mẫu thành công!');
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi khởi tạo bảng hoặc Seed dữ liệu: ${error.message}`,
        error.stack,
      );
    }
  }
}
