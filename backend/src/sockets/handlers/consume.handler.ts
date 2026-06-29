import { Socket } from 'socket.io';
import { roomManager } from '../../mediasoup/RoomManager.js';
import type { RtpCapabilities } from 'mediasoup/types';

export function registerConsumeHandlers(socket: Socket): void {
  socket.on(
    'consume',
    async (
      payload: {
        meetingId: string;
        producerId: string;
        rtpCapabilities: RtpCapabilities;
      },
      callback
    ) => {
      try {
        const peerId = socket.data.peerId as string;
        const room = roomManager.getRoom(payload.meetingId);
        if (!room) throw new Error('Room not found');

        const consumerData = await room.consume(
          peerId,
          payload.producerId,
          payload.rtpCapabilities
        );

        callback?.(consumerData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'CONSUME_FAILED', message } });
      }
    }
  );

  socket.on(
    'resume-consumer',
    async (payload: { meetingId: string; consumerId: string }, callback) => {
      try {
        const peerId = socket.data.peerId as string;
        const room = roomManager.getRoom(payload.meetingId);
        const peer = room?.getPeer(peerId);
        const consumer = peer?.consumers.get(payload.consumerId);
        if (!consumer) throw new Error('Consumer not found');
        await consumer.resume();
        callback?.({ resumed: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'RESUME_FAILED', message } });
      }
    }
  );
}
