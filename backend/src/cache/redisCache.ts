import { redisClient } from '../config/redis';
import { Logger } from 'pino';

export class RedisCache {
  private client: typeof redisClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.client = redisClient;
    this.logger = logger;
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error: any) {
      this.logger.error(`Redis GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error: any) {
      this.logger.error(`Redis SET error for key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error: any) {
      this.logger.error(`Redis DEL error for key ${key}: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Redis EXISTS error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error: any) {
      this.logger.error(`Redis FLUSHALL error: ${error.message}`);
    }
  }
}