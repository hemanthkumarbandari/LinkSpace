import { redisClient } from '../config/redis.config.js';

const ROOM_PREFIX = 'room:';
const SESSION_PREFIX = 'session:';

export async function cacheRoomState(
  meetingId: string,
  data: Record<string, unknown>
): Promise<void> {
  await redisClient.setex(
    `${ROOM_PREFIX}${meetingId}`,
    3600,
    JSON.stringify(data)
  );
}

export async function getRoomState(
  meetingId: string
): Promise<Record<string, unknown> | null> {
  const raw = await redisClient.get(`${ROOM_PREFIX}${meetingId}`);
  if (!raw) return null;
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function deleteRoomState(meetingId: string): Promise<void> {
  await redisClient.del(`${ROOM_PREFIX}${meetingId}`);
}

export async function cacheUserSession(
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await redisClient.setex(
    `${SESSION_PREFIX}${userId}`,
    86400,
    JSON.stringify(data)
  );
}

export async function publishRoomEvent(
  meetingId: string,
  event: string,
  payload: unknown
): Promise<void> {
  await redisClient.publish(
    `room:${meetingId}:event`,
    JSON.stringify({ event, payload })
  );
}
