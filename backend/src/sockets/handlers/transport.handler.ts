import { Socket } from 'socket.io';
import { roomManager } from '../../mediasoup/RoomManager.js';
import type { DtlsParameters } from 'mediasoup/types';

export function registerTransportHandlers(socket: Socket): void {
  socket.on(
    'get-rtp-capabilities',
    async (payload: { meetingId: string }, callback) => {
      try {
        const room = roomManager.getRoom(payload.meetingId);
        if (!room) throw new Error('Room not found');
        callback?.({ rtpCapabilities: room.getRtpCapabilities() });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'RTP_FAILED', message } });
      }
    }
  );

  socket.on(
    'create-transport',
    async (
      payload: { meetingId: string; direction: 'send' | 'recv' },
      callback
    ) => {
      try {
        const peerId = socket.data.peerId as string;
        const room = roomManager.getRoom(payload.meetingId);
        if (!room) throw new Error('Room not found');

        const transport = await room.createWebRtcTransport(peerId, payload.direction);

        callback?.({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'TRANSPORT_FAILED', message } });
      }
    }
  );

  socket.on(
    'connect-transport',
    async (
      payload: {
        meetingId: string;
        transportId: string;
        dtlsParameters: DtlsParameters;
      },
      callback
    ) => {
      try {
        const peerId = socket.data.peerId as string;
        const room = roomManager.getRoom(payload.meetingId);
        if (!room) throw new Error('Room not found');

        await room.connectTransport(
          peerId,
          payload.transportId,
          payload.dtlsParameters
        );
        callback?.({ connected: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed';
        callback?.({ error: { code: 'CONNECT_FAILED', message } });
      }
    }
  );
}
