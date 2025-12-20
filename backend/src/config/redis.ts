import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default TTL
};

// Use REDIS_URL if provided, otherwise use individual variables
export const redisClient = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      // Add password if provided
      ...(process.env.REDIS_PASS && { password: process.env.REDIS_PASS }),
    });

export default redisConfig;