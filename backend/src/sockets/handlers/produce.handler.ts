import { Socket } from 'socket.io';
import { roomManager } from '../../mediasoup/RoomManager.js';
import { Participant } from '../../models/Participant.model.js';
import type { RtpParameters, MediaKind } from 'mediasoup/types';

export function registerProduceHandlers(socket: Socket): void {
  socket.on(
    'produce',
    async (
      payload: {
        meetingId: string;
        transportId: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
        appData?: Record<string, unknown>;
      },
      callback
    ) => {
      try {
        const peerId = socket.data.peerId as string;
        const room = roomManager.getRoom(payload.meetingId);
        if (!room) throw new Error('Room not found');

        const producer = await room.produce(
          peerId,
          payload.transportId,
          payload.kind,
          payload.rtpParameters,
          payload.appData
        );

        if (payload.appData?.source === 'screen') {
          await Participant.updateOne(
            { meetingId: payload.meetingId, peerId },
            { isScreenSharing: true }
          );
          room.emitToAll('screen-share-started', { peerId });
        }

        callback?.({ producerId: producer.id });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'PRODUCE_FAILED', message } });
      }
    }
  );

  socket.on('pause-producer', async (payload: { meetingId: string; producerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peer = room?.getPeer(socket.data.peerId as string);
    const producer = peer?.producers.get(payload.producerId);
    await producer?.pause();
  });

  socket.on('resume-producer', async (payload: { meetingId: string; producerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peer = room?.getPeer(socket.data.peerId as string);
    const producer = peer?.producers.get(payload.producerId);
    await producer?.resume();
  });

  socket.on('close-producer', async (payload: { meetingId: string; producerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    if (!room) return;
    await room.closeProducer(socket.data.peerId as string, payload.producerId);
  });
}
