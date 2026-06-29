import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

// Helps Atlas SRV resolution on some Windows networks
dns.setDefaultResultOrder('ipv4first');

export async function connectMongo(): Promise<void> {
  const rawUri = env.MONGODB_URI;
  const uri =
    rawUri.includes('<db_password>')
      ? rawUri.replace(
          '<db_password>',
          encodeURIComponent(env.MONGODB_PASSWORD ?? '')
        )
      : rawUri;

  if (rawUri.includes('<db_password>') && !env.MONGODB_PASSWORD) {
    throw new Error(
      'MONGODB_URI contains <db_password> placeholder but MONGODB_PASSWORD is not set'
    );
  }

  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
