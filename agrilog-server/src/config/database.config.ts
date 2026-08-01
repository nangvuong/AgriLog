import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Cấu hình Cơ sở dữ liệu PostgreSQL + PostGIS cho NestJS (TypeORM)
 * Đọc từ biến môi trường (DATABASE_URL hoặc thông số riêng lẻ)
 */
export default registerAs('database', (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: false, // TUYỆT ĐỐI không dùng synchronize = true trên Production, dùng Migrations
      logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Số lượng connection trong Pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    };
  }

  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'agrilog_db',
    autoLoadEntities: true,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  };
});
