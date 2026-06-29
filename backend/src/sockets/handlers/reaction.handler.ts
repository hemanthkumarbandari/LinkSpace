import { Socket } from 'socket.io';
import { roomManager } from '../../mediasoup/RoomManager.js';
import { Meeting } from '../../models/Meeting.model.js';
import * as meetingService from '../../services/meeting.service.js';
import { Participant } from '../../models/Participant.model.js';

const handLowerTimers = new Map<string, ReturnType<typeof setTimeout>>();

function isHostOrCoHost(socket: Socket, room: ReturnType<typeof roomManager.getRoom>): boolean {
  const peer = room?.getPeer(socket.data.peerId as string);
  return peer?.role === 'host' || peer?.role === 'co-host';
}

export function registerReactionHandlers(socket: Socket): void {
  socket.on('raise-hand', (payload: { meetingId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peer = room?.getPeer(socket.data.peerId as string);
    if (!peer) return;
    peer.handRaised = true;
    const state = {
      peerId: peer.peerId,
      micEnabled: peer.micEnabled,
      cameraEnabled: peer.cameraEnabled,
      handRaised: true,
    };
    room?.emitToAll('peer-state-updated', state);

    const existing = handLowerTimers.get(peer.peerId);
    if (existing) clearTimeout(existing);

    handLowerTimers.set(
      peer.peerId,
      setTimeout(() => {
        handLowerTimers.delete(peer.peerId);
        const roomNow = roomManager.getRoom(payload.meetingId);
        const p = roomNow?.getPeer(peer.peerId);
        if (!p?.handRaised) return;
        p.handRaised = false;
        roomNow?.emitToAll('peer-state-updated', {
          peerId: p.peerId,
          micEnabled: p.micEnabled,
          cameraEnabled: p.cameraEnabled,
          handRaised: false,
        });
      }, 5000)
    );
  });

  socket.on('lower-hand', (payload: { meetingId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peer = room?.getPeer(socket.data.peerId as string);
    if (!peer) return;
    peer.handRaised = false;
    const timer = handLowerTimers.get(peer.peerId);
    if (timer) {
      clearTimeout(timer);
      handLowerTimers.delete(peer.peerId);
    }
    const state = {
      peerId: peer.peerId,
      micEnabled: peer.micEnabled,
      cameraEnabled: peer.cameraEnabled,
      handRaised: false,
    };
    room?.emitToAll('peer-state-updated', state);
  });

  socket.on('send-reaction', (payload: { meetingId: string; emoji: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peer = room?.getPeer(socket.data.peerId as string);
    if (!peer) return;
    room?.emitToAll('reaction', {
      peerId: peer.peerId,
      displayName: peer.displayName,
      emoji: payload.emoji,
    });
  });

  socket.on('mute-participant', async (payload: { meetingId: string; targetPeerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    if (!room || !isHostOrCoHost(socket, room)) return;

    const target = room.getPeer(payload.targetPeerId);
    if (!target) return;

    for (const producer of target.producers.values()) {
      if (producer.kind === 'audio') await producer.pause();
    }
    target.micEnabled = false;

    const targetSocket = socket.nsp.sockets.get(
      [...socket.nsp.sockets.values()].find(
        (s) => s.data.peerId === payload.targetPeerId
      )?.id ?? ''
    );

    socket.nsp.sockets.forEach((s) => {
      if (s.data.peerId === payload.targetPeerId) {
        s.emit('you-are-muted', { by: room.getPeer(socket.data.peerId as string)?.displayName });
      }
    });
  });

  socket.on('remove-participant', async (payload: { meetingId: string; targetPeerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    if (!room || !isHostOrCoHost(socket, room)) return;

    socket.nsp.sockets.forEach((s) => {
      if (s.data.peerId === payload.targetPeerId) {
        s.emit('you-are-removed', { reason: 'Removed by host' });
        s.disconnect(true);
      }
    });
  });

  socket.on('admit-from-waiting', (payload: { meetingId: string; targetPeerId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    if (!room || !isHostOrCoHost(socket, room)) return;

    const peer = room.admitPeer(payload.targetPeerId);
    if (!peer) return;

    socket.nsp.sockets.forEach((s) => {
      if (s.data.peerId === payload.targetPeerId) {
        s.emit('waiting-room-admitted', {});
        s.emit('room-joined', {
          peers: Array.from(room.peers.values())
            .filter((p) => p.peerId !== peer.peerId)
            .map((p) => p.toInfo()),
          rtpCapabilities: room.getRtpCapabilities(),
          peerId: peer.peerId,
          existingProducers: room.getOtherProducers(peer.peerId),
        });
      }
    });

    socket.to(payload.meetingId).emit('participant-admitted', { peerId: peer.peerId });
    socket.to(payload.meetingId).emit('peer-joined', { peer: peer.toInfo() });
  });

  socket.on('end-meeting', async (payload: { meetingId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    if (!room || !isHostOrCoHost(socket, room)) return;

    const meeting = await Meeting.findOne({ meetingId: payload.meetingId });
    if (!meeting) return;

    await meetingService.endMeeting(payload.meetingId, meeting.hostId.toString());
  });

  socket.on('screen-share-start', (payload: { meetingId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peerId = socket.data.peerId as string;
    const peer = room?.getPeer(peerId);
    if (peer) peer.isScreenSharing = true;
    room?.emitToAll('screen-share-started', { peerId });
  });

  socket.on('screen-share-stop', async (payload: { meetingId: string }) => {
    const room = roomManager.getRoom(payload.meetingId);
    const peerId = socket.data.peerId as string;
    const peer = room?.getPeer(peerId);
    if (peer) peer.isScreenSharing = false;
    await Participant.updateOne(
      { meetingId: payload.meetingId, peerId },
      { isScreenSharing: false }
    );
    room?.emitToAll('screen-share-stopped', { peerId });
  });
}
