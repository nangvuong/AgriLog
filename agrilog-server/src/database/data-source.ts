import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

/**
 * TypeORM DataSource dùng cho CLI (Migrations: generate, run, revert)
 * Không dùng cho runtime NestJS (runtime dùng database.module.ts)
 */
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/agrilog_db',
  entities: [path.join(__dirname, '../modules/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false, // Luôn quản lý schema bằng Migration
  logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
