import express from 'express';
import http from 'http';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.config.js';
import { resolveCorsOrigin } from './config/cors.config.js';
import { connectMongo, disconnectMongo } from './config/mongo.config.js';
import { disconnectRedis } from './config/redis.config.js';
import { workerManager } from './mediasoup/WorkerManager.js';
import { initSocketServer } from './sockets/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import { logger } from './utils/logger.js';
import { seedAdmin } from './scripts/seedAdmin.js';

import authRoutes from './routes/auth.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import recordingRoutes from './routes/recording.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const server = http.createServer(app);

// Render (and similar hosts) sit behind a reverse proxy that sets X-Forwarded-For.
app.set('trust proxy', 1);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const resolved = resolveCorsOrigin(origin);
    if (resolved === false) {
      callback(null, false);
      return;
    }
    callback(null, resolved);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(apiRateLimiter);

// Local recordings (for production use S3/R2/etc.)
app.use(
  '/recordings',
  express.static(path.join(process.cwd(), 'uploads', 'recordings'))
);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

initSocketServer(server);

async function bootstrap(): Promise<void> {
  await connectMongo();
  await seedAdmin();
  await workerManager.init();

  if (env.NODE_ENV === 'production') {
    if (!env.MEDIASOUP_ANNOUNCED_IP) {
      logger.warn(
        'MEDIASOUP_ANNOUNCED_IP is unset — remote video may fail. Set it to your server public IP.'
      );
    } else if (
      env.MEDIASOUP_ANNOUNCED_IP === '127.0.0.1' ||
      env.MEDIASOUP_ANNOUNCED_IP === 'localhost'
    ) {
      logger.warn(
        'MEDIASOUP_ANNOUNCED_IP is localhost — remote participants cannot connect media. Use your public IP.'
      );
    }
    if (
      env.TURN_SERVER_IP &&
      (env.TURN_SERVER_IP === '127.0.0.1' || env.TURN_SERVER_IP === 'localhost')
    ) {
      logger.warn(
        'TURN_SERVER_IP is localhost — remove TURN_* vars if coturn is not running, or set the real TURN host.'
      );
    }
  }

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down...');
  await workerManager.close();
  await disconnectMongo();
  await disconnectRedis();
  server.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

bootstrap().catch((err) => {
  logger.error('Bootstrap failed', {
    err,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
