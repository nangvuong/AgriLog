import { registerAs } from '@nestjs/config';

export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  url?: string;
}

export default registerAs(
  'redis',
  (): IRedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    url: process.env.REDIS_URL || undefined,
  }),
);
