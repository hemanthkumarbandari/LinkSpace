import { routerOptions } from '../config/mediasoup.config.js';
import { workerManager } from './WorkerManager.js';
import { Room } from './Room.js';
import { cacheRoomState, deleteRoomState } from '../utils/redis.utils.js';
import { logger } from '../utils/logger.js';
import type { Namespace } from 'socket.io';

const GRACE_PERIOD_MS = 30_000;

export class RoomManager {
  private rooms = new Map<string, Room>();
  private destroyTimers = new Map<string, NodeJS.Timeout>();
  private io?: Namespace;

  setSocketServer(io: Namespace): void {
    this.io = io;
  }

  async getOrCreateRoom(meetingId: string, waitingRoom = false): Promise<Room> {
    const existing = this.rooms.get(meetingId);
    if (existing) {
      if (this.destroyTimers.has(meetingId)) {
        clearTimeout(this.destroyTimers.get(meetingId)!);
        this.destroyTimers.delete(meetingId);
      }
      return existing;
    }

    const worker = workerManager.getWorker();
    const router = await worker.createRouter({ mediaCodecs: routerOptions.mediaCodecs });
    workerManager.incrementLoad(worker);

    const room = new Room(meetingId, router, this.io);
    room.setWaitingRoom(waitingRoom);
    this.rooms.set(meetingId, room);

    await cacheRoomState(meetingId, {
      meetingId,
      peerCount: 0,
      createdAt: new Date().toISOString(),
    });

    logger.info('Room created', { meetingId });
    return room;
  }

  getRoom(meetingId: string): Room | undefined {
    return this.rooms.get(meetingId);
  }

  scheduleDestroy(meetingId: string): void {
    if (this.destroyTimers.has(meetingId)) return;

    const timer = setTimeout(async () => {
      const room = this.rooms.get(meetingId);
      if (room && room.getPeerCount() === 0) {
        await this.destroyRoom(meetingId);
      }
      this.destroyTimers.delete(meetingId);
    }, GRACE_PERIOD_MS);

    this.destroyTimers.set(meetingId, timer);
  }

  async destroyRoom(meetingId: string): Promise<void> {
    const room = this.rooms.get(meetingId);
    if (!room) return;

    await room.close();
    this.rooms.delete(meetingId);
    await deleteRoomState(meetingId);
    logger.info('Room destroyed', { meetingId });
  }
}

export const roomManager = new RoomManager();
