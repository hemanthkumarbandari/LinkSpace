'use client';

import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import type { Transport } from 'mediasoup-client/types';
import { getDevice, resetDevice } from '@/lib/mediasoupClient';
import { mediasoupSession, resetMediasoupSession } from '@/lib/mediasoupSession';
import { useUiStore } from '@/store/uiStore';
import { getMeetingSocket, waitUntilSocketConnected } from '@/services/socket.service';
import { useMeetingStore } from '@/store/meetingStore';
import { useParticipantStore } from '@/store/participantStore';
import { useMediaStore } from '@/store/mediaStore';
import { useAuthStore } from '@/store/authStore';
import type { RoomJoinedEvent, NewProducerEvent } from '@/types/socket.types';

type RouterRtpCapabilities = Parameters<ReturnType<typeof getDevice>['load']>[0]['routerRtpCapabilities'];
type IceParameters = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['iceParameters'];
type IceCandidates = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['iceCandidates'];
type DtlsParameters = Parameters<ReturnType<typeof getDevice>['createSendTransport']>[0]['dtlsParameters'];

function emitAck<T>(
  socket: Socket,
  event: string,
  payload: Record<string, unknown>,
  timeoutMs = 30000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for "${event}". Check server and WebSocket proxy.`));
    }, timeoutMs);

    socket.emit(event, payload, (response: T & { error?: { code?: string; message: string } }) => {
      clearTimeout(timer);
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        const err = new Error(response.error.message);
        (err as unknown as { code?: string }).code = response.error.code;
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

function waitForSocketConnection(socket: Socket, timeoutMs = 25000): Promise<void> {
  return waitUntilSocketConnected(socket, timeoutMs);
}

function watchTransportState(transport: Transport, label: string): void {
  transport.on('connectionstatechange', (state) => {
    if (state === 'failed' && useMeetingStore.getState().status === 'connected') {
      toast.error(
        `${label} media connection failed. Open UDP ports 40000-40099 and set MEDIASOUP_ANNOUNCED_IP to your server's public IP.`
      );
    }
  });
}

async function ensureLiveLocalStream(): Promise<MediaStream> {
  const { localStream, setLocalStream } = useMediaStore.getState();
  const tracksLive =
    localStream?.getTracks().length &&
    localStream.getTracks().every((t) => t.readyState === 'live');

  if (localStream && tracksLive) return localStream;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    setLocalStream(stream);
    return stream;
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied. Allow access in your browser settings.');
      }
      if (err.name === 'NotFoundError') {
        throw new Error('No camera or microphone found on this device.');
      }
    }
    throw err;
  }
}

export function useMediasoup(meetingId: string) {

  const { setStatus, setLocalPeerId } = useMeetingStore();
  const { addPeer, removePeer, updatePeer, setLocalPeer, setPeerStream } =
    useParticipantStore();
  const { localStream, isScreenSharing, stopScreenShare } = useMediaStore();
  const getMeetingAccessToken = useAuthStore((s) => s.getMeetingAccessToken);
  const clearGuestSession = useAuthStore((s) => s.clearGuestSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const leaveRoom = useCallback(() => {
    mediasoupSession.joining = false;
    const socket = getMeetingSocket(getMeetingAccessToken() ?? '');
    socket.emit('leave-room', { meetingId });
    socket.off('new-producer');
    socket.off('producer-closed');
    socket.off('peer-joined');
    socket.off('peer-left');
    socket.off('peer-state-updated');
    socket.off('meeting-ended');
    socket.off('screen-share-started');
    socket.off('screen-share-stopped');
    socket.off('reaction');
    resetMediasoupSession();
    resetDevice();
    useParticipantStore.getState().reset();
    setStatus('idle');
    if (!isAuthenticated) clearGuestSession();
  }, [meetingId, getMeetingAccessToken, setStatus, isAuthenticated, clearGuestSession]);

  const consumeProducer = useCallback(
    async (
      socket: Socket,
      producerId: string,
      peerId: string,
      appData?: Record<string, unknown>
    ) => {
      const localId = useMeetingStore.getState().localPeerId;
      if (peerId === localId) return;
      if (mediasoupSession.consumedProducerIds.has(producerId)) return;

      const device = getDevice();
      const recvTransport = mediasoupSession.recvTransport;
      if (!recvTransport || !device.loaded) return;

      try {
        const data = await emitAck<{
          id: string;
          producerId: string;
          kind: 'audio' | 'video';
          rtpParameters: Parameters<Transport['consume']>[0]['rtpParameters'];
        }>(socket, 'consume', {
          meetingId,
          producerId,
          rtpCapabilities: device.rtpCapabilities,
        });

        const consumer = await recvTransport.consume({
          id: data.id,
          producerId: data.producerId,
          kind: data.kind,
          rtpParameters: data.rtpParameters,
        });

        await emitAck(socket, 'resume-consumer', {
          meetingId,
          consumerId: consumer.id,
        });

        mediasoupSession.consumedProducerIds.add(producerId);
        mediasoupSession.consumers.set(consumer.id, consumer);

        const stream = new MediaStream([consumer.track]);
        const peer = useParticipantStore.getState().peers.get(peerId);
        const isScreen =
          appData?.source === 'screen' ||
          (consumer.appData as { source?: string } | undefined)?.source === 'screen';
        if (isScreen) {
          updatePeer(peerId, { screenStream: stream, isScreenSharing: true });
        } else {
          const existing = peer?.stream;
          if (existing) {
            existing.addTrack(consumer.track);
            setPeerStream(peerId, existing);
          } else {
            setPeerStream(peerId, stream);
          }
        }
      } catch {
        // Skip stale or incompatible producers — join should still succeed.
      }
    },
    [meetingId, setPeerStream, updatePeer]
  );

  const joinRoom = useCallback(
    async (displayName: string, opts?: { force?: boolean }) => {
      const store = useAuthStore.getState();
      if (store.isAuthenticated) {
        const fresh = await store.ensureFreshSession();
        if (!fresh) {
          setStatus('idle');
          throw new Error('Session expired. Please sign in again.');
        }
      }
      const token = store.getMeetingAccessToken();
      if (!token) {
        setStatus('idle');
        throw new Error('Could not start meeting session.');
      }
      if (mediasoupSession.joining) return;
      mediasoupSession.joining = true;
      setStatus('connecting');

      try {
      const socket = getMeetingSocket(token);
      await waitForSocketConnection(socket);
      socket.off('new-producer');
      socket.off('producer-closed');
      socket.off('peer-joined');
      socket.off('peer-left');
      socket.off('peer-state-updated');
      socket.off('meeting-ended');
      socket.off('room-joined');
      socket.off('waiting-room-admitted');
      socket.off('screen-share-started');
      socket.off('screen-share-stopped');
      socket.off('reaction');
      const device = getDevice();

      const setupConnected = async (joined: RoomJoinedEvent) => {
        await device.load({
          routerRtpCapabilities: joined.rtpCapabilities as RouterRtpCapabilities,
        });
        setLocalPeerId(joined.peerId);
        setLocalPeer({
          peerId: joined.peerId,
          userId: useAuthStore.getState().user?._id ?? '',
          displayName,
          role: joined.role ?? 'participant',
          micEnabled: joined.micEnabled ?? true,
          cameraEnabled: joined.cameraEnabled ?? true,
          handRaised: false,
          isScreenSharing: false,
        });

        joined.peers.forEach((p) => addPeer(p));

        const sendData = await emitAck<{
          id: string;
          iceParameters: IceParameters;
          iceCandidates: IceCandidates;
          dtlsParameters: DtlsParameters;
        }>(socket, 'create-transport', { meetingId, direction: 'send' });

        const sendTransport = device.createSendTransport({
          id: sendData.id,
          iceParameters: sendData.iceParameters,
          iceCandidates: sendData.iceCandidates,
          dtlsParameters: sendData.dtlsParameters,
        });
        mediasoupSession.sendTransport = sendTransport;
        watchTransportState(sendTransport, 'Outgoing');

        sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          emitAck(socket, 'connect-transport', {
            meetingId,
            transportId: sendTransport.id,
            dtlsParameters,
          })
            .then(() => callback())
            .catch(errback);
        });

        sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            const { producerId } = await emitAck<{ producerId: string }>(socket, 'produce', {
              meetingId,
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              appData,
            });
            callback({ id: producerId });
          } catch (e) {
            errback(e as Error);
          }
        });

        const recvData = await emitAck<typeof sendData>(socket, 'create-transport', {
          meetingId,
          direction: 'recv',
        });

        const recvTransport = device.createRecvTransport({
          id: recvData.id,
          iceParameters: recvData.iceParameters,
          iceCandidates: recvData.iceCandidates,
          dtlsParameters: recvData.dtlsParameters,
        });
        mediasoupSession.recvTransport = recvTransport;
        watchTransportState(recvTransport, 'Incoming');

        recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          emitAck(socket, 'connect-transport', {
            meetingId,
            transportId: recvTransport.id,
            dtlsParameters,
          })
            .then(() => callback())
            .catch(errback);
        });

        const stream = await ensureLiveLocalStream().catch(() => null);
        if (stream) {
          const audioTrack = stream.getAudioTracks()[0];
          const videoTrack = stream.getVideoTracks()[0];
          try {
            if (audioTrack?.readyState === 'live') {
              const p = await sendTransport.produce({ track: audioTrack });
              mediasoupSession.producers.set(p.id, p);
            }
          } catch {
            // Mic produce failed — still allow joining.
          }
          try {
            if (videoTrack?.readyState === 'live') {
              const p = await sendTransport.produce({ track: videoTrack });
              mediasoupSession.producers.set(p.id, p);
            }
          } catch {
            // Camera produce failed — still allow joining.
          }
        }

        socket.on('new-producer', (data: NewProducerEvent) => {
          void consumeProducer(socket, data.producerId, data.peerId, data.appData);
        });

        socket.on('screen-share-started', ({ peerId }: { peerId: string }) => {
          const localId = useMeetingStore.getState().localPeerId;
          if (peerId === localId) {
            const lp = useParticipantStore.getState().localPeer;
            if (lp) setLocalPeer({ ...lp, isScreenSharing: true });
          } else {
            updatePeer(peerId, { isScreenSharing: true });
          }
        });

        socket.on('screen-share-stopped', ({ peerId }: { peerId: string }) => {
          const localId = useMeetingStore.getState().localPeerId;
          if (peerId === localId) {
            stopScreenShare();
            const lp = useParticipantStore.getState().localPeer;
            if (lp) setLocalPeer({ ...lp, isScreenSharing: false });
          } else {
            updatePeer(peerId, { isScreenSharing: false, screenStream: undefined });
          }
        });

        socket.on('producer-closed', ({ producerId, peerId }: { producerId: string; peerId: string }) => {
          for (const [id, consumer] of mediasoupSession.consumers) {
            if (consumer.producerId === producerId) {
              const wasScreen =
                (consumer.appData as { source?: string } | undefined)?.source === 'screen';
              consumer.close();
              mediasoupSession.consumers.delete(id);
              if (wasScreen) {
                updatePeer(peerId, { isScreenSharing: false, screenStream: undefined });
              }
            }
          }
        });

        socket.on('peer-joined', ({ peer }: { peer: Parameters<typeof addPeer>[0] }) => {
          const localId = useMeetingStore.getState().localPeerId;
          if (peer.peerId !== localId) addPeer(peer);
        });

        socket.on('peer-left', ({ peerId }: { peerId: string }) => {
          removePeer(peerId);
        });

        socket.on('peer-state-updated', (data: {
          peerId: string;
          micEnabled: boolean;
          cameraEnabled: boolean;
          handRaised: boolean;
        }) => {
          const localId = useMeetingStore.getState().localPeerId;
          if (data.peerId === localId) {
            const lp = useParticipantStore.getState().localPeer;
            if (lp) setLocalPeer({ ...lp, ...data });
          } else {
            updatePeer(data.peerId, data);
          }
        });

        socket.on(
          'reaction',
          (data: { peerId: string; displayName: string; emoji: string }) => {
            useUiStore.getState().addReaction(data);
          }
        );

        socket.on('meeting-ended', () => {
          useMeetingStore.getState().endMeeting();
          setStatus('ended');
          leaveRoom();
        });

        setStatus('connected');
        mediasoupSession.joining = false;

        void (async () => {
          for (const prod of joined.existingProducers ?? []) {
            if (prod.kind === 'audio' || prod.kind === 'video') {
              await consumeProducer(
                socket,
                prod.producerId,
                prod.peerId,
                prod.appData as Record<string, unknown> | undefined
              );
            }
          }
        })();
      };

      const joined = await emitAck<RoomJoinedEvent>(socket, 'join-room', {
        meetingId,
        token,
        displayName,
        force: opts?.force === true,
      });

      if (joined.waiting) {
        setStatus('waiting');
        setLocalPeerId(joined.peerId);
        setLocalPeer({
          peerId: joined.peerId,
          userId: useAuthStore.getState().user?._id ?? '',
          displayName,
          role: joined.role ?? 'participant',
          micEnabled: joined.micEnabled ?? true,
          cameraEnabled: joined.cameraEnabled ?? true,
          handRaised: false,
          isScreenSharing: false,
        });
        mediasoupSession.joining = false;

        socket.on('waiting-room-admitted', () => {
          // UI remains in waiting until room-joined arrives
        });
        socket.on('room-joined', (data: RoomJoinedEvent) => {
          void setupConnected(data);
        });
        return;
      }

      await setupConnected(joined);
    } catch (err) {
      mediasoupSession.joining = false;
      throw err;
    }
    },
    [
      getMeetingAccessToken,
      meetingId,
      addPeer,
      removePeer,
      updatePeer,
      setLocalPeer,
      setLocalPeerId,
      setStatus,
      consumeProducer,
      leaveRoom,
      stopScreenShare,
    ]
  );

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const transport = mediasoupSession.sendTransport;
      if (!transport) {
        stream.getTracks().forEach((t) => t.stop());
        toast.error('Not connected yet. Wait until the meeting finishes loading.');
        return;
      }
      const producer = await transport.produce({
        track: stream.getVideoTracks()[0],
        appData: { source: 'screen' },
      });
      mediasoupSession.producers.set(producer.id, producer);
      stream.getVideoTracks()[0].onended = () => {
        producer.close();
        getMeetingSocket(getMeetingAccessToken() ?? '').emit('screen-share-stop', { meetingId });
        stopScreenShare();
        const lp = useParticipantStore.getState().localPeer;
        if (lp) setLocalPeer({ ...lp, isScreenSharing: false });
      };
      useMediaStore.getState().startScreenShare(stream);
      const lp = useParticipantStore.getState().localPeer;
      if (lp) setLocalPeer({ ...lp, isScreenSharing: true });
      getMeetingSocket(getMeetingAccessToken() ?? '').emit('screen-share-start', { meetingId });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied.');
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to start screen share';
      toast.error(message);
    }
  }, [meetingId, getMeetingAccessToken, stopScreenShare, setLocalPeer]);

  return { joinRoom, leaveRoom, startScreenShare, isScreenSharing };
}
