import Redis from 'ioredis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const redisPub = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const redisSub = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => logger.error('Redis error', { err }));
redisClient.on('connect', () => logger.info('Redis connected'));

export async function disconnectRedis(): Promise<void> {
  await Promise.all([
    redisClient.quit(),
    redisPub.quit(),
    redisSub.quit(),
  ]);
  logger.info('Redis disconnected');
}
