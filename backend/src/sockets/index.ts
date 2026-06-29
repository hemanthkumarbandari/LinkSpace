import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { resolveCorsOrigin } from '../config/cors.config.js';
import type { CorsOptions } from 'cors';
import { redisPub, redisSub } from '../config/redis.config.js';
import { roomManager } from '../mediasoup/RoomManager.js';
import { registerMeetingHandlers } from './meeting.socket.js';
import { logger } from '../utils/logger.js';

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const socketCors: CorsOptions = {
    origin(origin, callback) {
      const resolved = resolveCorsOrigin(origin);
      if (resolved === false) {
        callback(null, false);
        return;
      }
      callback(null, resolved);
    },
    credentials: true,
  };

  const io = new SocketServer(httpServer, {
    cors: socketCors,
    path: '/socket.io',
  });

  io.adapter(createAdapter(redisPub, redisSub));

  const meetingNs = io.of('/meeting');
  roomManager.setSocketServer(meetingNs);
  registerMeetingHandlers(meetingNs);

  logger.info('Socket.IO initialized on /meeting namespace');
  return io;
}
