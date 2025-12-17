import Redis from 'ioredis';

// Suporta tanto REDIS_URL (Upstash, Heroku, etc) quanto host/port
export const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

export default redisConnection;
