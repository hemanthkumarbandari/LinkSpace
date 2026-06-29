import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';

const isDev = env.NODE_ENV === 'development';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 200,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests' },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many auth attempts' },
  },
});
