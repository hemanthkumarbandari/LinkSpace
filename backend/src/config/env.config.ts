import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1),
  // Optional helper for "Standard" (non-SRV) URIs that use a <db_password> placeholder
  // so you don't have to commit/paste credentials into the URI itself.
  MONGODB_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  MEDIASOUP_LISTEN_IP: z.string().default('0.0.0.0'),
  // When unset, mediasoup will advertise the machine interface IPs.
  // Setting this to 127.0.0.1 breaks remote participants.
  MEDIASOUP_ANNOUNCED_IP: z.string().optional(),
  TURN_SERVER_IP: z.string().optional(),
  TURN_USERNAME: z.string().optional(),
  TURN_PASSWORD: z.string().optional(),
  FRONTEND_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  /** Comma-separated extra CORS origins, e.g. https://meet.now.nuhvin.com */
  CORS_ORIGINS: z.string().optional(),

  ADMIN_SEED_EMAIL: z.string().email().default('admin@ngs.com'),
  ADMIN_SEED_PASSWORD: z.string().min(1).default('ngs@123'),
  ADMIN_SEED_NAME: z.string().min(1).default('NGS Admin'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
