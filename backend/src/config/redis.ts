import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default TTL
};

export const redisClient = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
});

export default redisConfig;