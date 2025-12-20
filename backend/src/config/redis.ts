import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Debug logging to see what environment variables are available
console.log('Redis Environment variables:');
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);

const redisConfig = {
  ttl: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default TTL
};

// Use REDIS_URL if provided (Render format), otherwise use individual variables
export const redisClient = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

export default redisConfig;