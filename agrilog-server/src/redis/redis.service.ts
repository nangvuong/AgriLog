import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IRedisConfig } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get<IRedisConfig>('redis');
    if (config?.url) {
      this.redisClient = new Redis(config.url);
    } else {
      this.redisClient = new Redis({
        host: config?.host || 'localhost',
        port: config?.port || 6380,
        password: config?.password,
        db: config?.db || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }

    this.redisClient.on('connect', () => {
      this.logger.log(
        `✅ Connected to Redis cache at ${config?.host || 'localhost'}:${config?.port || 6380}`,
      );
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('❌ Redis Client Error:', err.message);
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  /**
   * Lưu mã hoá Refresh Token của người dùng vào Redis kèm TTL (mặc định 7 ngày = 604800 giây)
   */
  async setRefreshToken(
    userId: number | string,
    tokenHash: string,
    ttlSeconds: number = 604800,
  ): Promise<void> {
    const key = this.getRefreshTokenKey(userId);
    await this.redisClient.set(key, tokenHash, 'EX', ttlSeconds);
  }

  /**
   * Truy xuất mã hoá Refresh Token từ Redis
   */
  async getRefreshToken(userId: number | string): Promise<string | null> {
    const key = this.getRefreshTokenKey(userId);
    return this.redisClient.get(key);
  }

  /**
   * Xóa Refresh Token khỏi Redis (Dùng cho Logout hoặc vô hiệu hoá phiên đăng nhập)
   */
  async removeRefreshToken(userId: number | string): Promise<void> {
    const key = this.getRefreshTokenKey(userId);
    await this.redisClient.del(key);
  }

  /**
   * Kiểm tra kết nối Redis (PING - PONG)
   */
  async checkHealth(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  private getRefreshTokenKey(userId: number | string): string {
    return `auth:refresh:${userId}`;
  }
}
