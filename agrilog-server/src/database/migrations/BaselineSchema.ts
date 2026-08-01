import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Baseline Migration: Khởi tạo schema CSDL từ file agrilog_schema.sql
 * Dùng khi muốn dựng schema thông qua CLI của TypeORM thay vì Docker initdb
 */
export class BaselineSchema1700000000000 implements MigrationInterface {
  name = 'BaselineSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kích hoạt extension PostGIS nếu chưa bật
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    // Đọc và thực thi file schema gốc của dự án (nếu muốn khởi tạo toàn bộ schema qua migration)
    const schemaPath = path.resolve(process.cwd(), '../agrilog_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      await queryRunner.query(sqlContent);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cascade toàn bộ 20 bảng trong trường hợp revert migration baseline
    await queryRunner.query(`
      DROP TABLE IF EXISTS 
        weather, harvest, observation, activity_asset, activity_material,
        activity_ai_extraction, activity_transcript, activity_media, activity,
        inventory, asset, material, activity_type, season, crop_variety,
        crop, plot, farmer, farm, "user"
      CASCADE;
    `);
  }
}
