import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { verifyAccessToken } from '../../utils/jwt.utils.js';
import { roomManager } from '../../mediasoup/RoomManager.js';
import { Peer } from '../../mediasoup/Peer.js';
import { Meeting } from '../../models/Meeting.model.js';
import { Participant } from '../../models/Participant.model.js';
import type { ParticipantRole } from '../../types/shared-types.js';
import { cacheRoomState } from '../../utils/redis.utils.js';
import { cleanupPeer } from './leaveRoom.handler.js';
import mongoose from 'mongoose';

interface JoinPayload {
  meetingId: string;
  token: string;
  displayName: string;
  force?: boolean;
}

export function registerJoinRoomHandler(socket: Socket): void {
  socket.on('join-room', async (payload: JoinPayload, callback) => {
    try {
      const { meetingId, token, displayName, force } = payload;
      const user = verifyAccessToken(token);
      const isGuest = user.role === 'guest';

      if (socket.data.peerId && socket.data.meetingId) {
        await cleanupPeer(socket);
      }

      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        callback?.({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
        return;
      }
      if (meeting.status === 'ended') {
        callback?.({ error: { code: 'MEETING_ENDED', message: 'Meeting ended' } });
        return;
      }

      const peerId = uuidv4();
      const isHost = !isGuest && meeting.hostId.toString() === user.userId;
      const role: ParticipantRole = isHost ? 'host' : 'participant';

      const room = await roomManager.getOrCreateRoom(
        meetingId,
        meeting.settings.waitingRoom
      );

      if (!isGuest) {
        const existing = room.findPeerByUserId(user.userId);
        if (existing) {
          if (!force) {
            callback?.({
              error: {
                code: 'ALREADY_JOINED',
                message: 'This account is already in the meeting from another device.',
              },
            });
            return;
          }
          room.disconnectPeer(existing.peerId, 'You joined the meeting from another device.');
        }
      }

      const peer = new Peer(peerId, user.userId, displayName, role, socket.id);
      if (meeting.settings.muteOnEntry && !isHost) {
        peer.micEnabled = false;
      }

      const admitImmediately = isHost || !meeting.settings.waitingRoom;
      const location = room.addPeer(peer, admitImmediately);

      await socket.join(meetingId);
      socket.data.peerId = peerId;
      socket.data.meetingId = meetingId;
      socket.data.userId = user.userId;
      socket.data.displayName = displayName;

      await Participant.create({
        meetingId,
        userId: new mongoose.Types.ObjectId(user.userId),
        displayName,
        role,
        socketId: socket.id,
        peerId,
        micEnabled: peer.micEnabled,
        cameraEnabled: peer.cameraEnabled,
      });

      if (meeting.status === 'waiting') {
        meeting.status = 'active';
        meeting.startedAt = new Date();
        await meeting.save();
      }

      await cacheRoomState(meetingId, {
        meetingId,
        peerCount: room.getPeerCount(),
      });

      if (location === 'waiting') {
        socket.to(meetingId).emit('peer-joined', { peer: peer.toInfo() });
        callback?.({
          waiting: true,
          peerId,
          role: peer.role,
          micEnabled: peer.micEnabled,
          cameraEnabled: peer.cameraEnabled,
          rtpCapabilities: room.getRtpCapabilities(),
        });
        return;
      }

      const peers = Array.from(room.peers.values())
        .filter((p) => p.peerId !== peerId)
        .map((p) => p.toInfo());

      socket.to(meetingId).emit('peer-joined', { peer: peer.toInfo() });

      callback?.({
        peers,
        rtpCapabilities: room.getRtpCapabilities(),
        peerId,
        role: peer.role,
        micEnabled: peer.micEnabled,
        cameraEnabled: peer.cameraEnabled,
        existingProducers: room.getOtherProducers(peerId),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Join failed';
      callback?.({ error: { code: 'JOIN_FAILED', message } });
      socket.emit('error', { code: 'JOIN_FAILED', message });
    }
  });
}
