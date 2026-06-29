import { Socket } from 'socket.io';
import { roomManager } from '../../mediasoup/RoomManager.js';
import { Participant } from '../../models/Participant.model.js';
import * as meetingService from '../../services/meeting.service.js';

export async function cleanupPeer(socket: Socket): Promise<void> {
  const { peerId, meetingId, userId } = socket.data as {
    peerId?: string;
    meetingId?: string;
    userId?: string;
  };

  if (!peerId || !meetingId) return;

  const room = roomManager.getRoom(meetingId);
  const peer = room?.removePeer(peerId);
  if (peer) {
    await peer.close();
    socket.to(meetingId).emit('peer-left', { peerId });
  }

  const participant = await Participant.findOne({
    meetingId,
    peerId,
    leftAt: { $exists: false },
  });

  if (participant) {
    const leftAt = new Date();
    participant.leftAt = leftAt;
    participant.duration = Math.round(
      (leftAt.getTime() - participant.joinedAt.getTime()) / 1000
    );
    await participant.save();

    if (userId) {
      await meetingService.upsertAttendance(
        meetingId,
        userId,
        participant.joinedAt,
        leftAt
      );
    }
  }

  await socket.leave(meetingId);

  if (room && room.getPeerCount() === 0) {
    roomManager.scheduleDestroy(meetingId);
  }

  delete socket.data.peerId;
  delete socket.data.meetingId;
  delete socket.data.displayName;
}

export function registerLeaveRoomHandler(socket: Socket): void {
  socket.on('leave-room', async (payload: { meetingId: string }) => {
    try {
      if (payload.meetingId === socket.data.meetingId) {
        await cleanupPeer(socket);
      }
    } catch {
      socket.emit('error', { code: 'LEAVE_FAILED', message: 'Failed to leave room' });
    }
  });

  socket.on('disconnect', async () => {
    await cleanupPeer(socket);
  });
}
