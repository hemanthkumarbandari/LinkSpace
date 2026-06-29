import type {
  Router,
  WebRtcTransport,
  RtpParameters,
  RtpCapabilities,
  WebRtcTransportOptions,
} from 'mediasoup/types';
import { Peer } from './Peer.js';
import { logger } from '../utils/logger.js';
import { getListenIps } from '../config/mediasoup.config.js';
import type { Namespace } from 'socket.io';

export class Room {
  public readonly peers = new Map<string, Peer>();
  public readonly waitingPeers = new Map<string, Peer>();
  private waitingRoomEnabled = false;

  constructor(
    public readonly meetingId: string,
    public readonly router: Router,
    private io?: Namespace
  ) {}

  setWaitingRoom(enabled: boolean): void {
    this.waitingRoomEnabled = enabled;
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId) ?? this.waitingPeers.get(peerId);
  }

  findPeerByUserId(userId: string): Peer | undefined {
    for (const p of this.peers.values()) {
      if (p.userId === userId) return p;
    }
    for (const p of this.waitingPeers.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  }

  disconnectPeer(peerId: string, reason = 'Disconnected'): void {
    const peer = this.getPeer(peerId);
    if (!peer) return;
    try {
      const s = this.io?.sockets.get(peer.socketId);
      s?.emit('force-disconnect', { reason });
      s?.disconnect(true);
    } catch (e) {
      logger.warn('Failed to disconnect peer', { meetingId: this.meetingId, peerId, reason, e });
    }
  }

  addPeer(peer: Peer, admitImmediately = false): 'room' | 'waiting' {
    if (this.waitingRoomEnabled && !admitImmediately && peer.role === 'participant') {
      peer.inWaitingRoom = true;
      this.waitingPeers.set(peer.peerId, peer);
      return 'waiting';
    }
    this.peers.set(peer.peerId, peer);
    return 'room';
  }

  admitPeer(peerId: string): Peer | undefined {
    const peer = this.waitingPeers.get(peerId);
    if (!peer) return undefined;
    peer.inWaitingRoom = false;
    this.waitingPeers.delete(peerId);
    this.peers.set(peerId, peer);
    return peer;
  }

  removePeer(peerId: string): Peer | undefined {
    const peer = this.peers.get(peerId) ?? this.waitingPeers.get(peerId);
    if (peer) {
      this.peers.delete(peerId);
      this.waitingPeers.delete(peerId);
    }
    return peer;
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  async createWebRtcTransport(
    peerId: string,
    direction: 'send' | 'recv'
  ): Promise<WebRtcTransport> {
    const peer = this.getPeer(peerId);
    if (!peer) throw new Error('Peer not found');

    const transportOptions: WebRtcTransportOptions = {
      listenIps: getListenIps() ?? [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 1000000,
    };
    const transport = await this.router.createWebRtcTransport(transportOptions);

    transport.on('dtlsstatechange', (state: string) => {
      if (state === 'closed') {
        logger.debug('Transport DTLS closed', { peerId, direction });
      }
    });

    if (direction === 'send') {
      peer.sendTransport = transport;
    } else {
      peer.recvTransport = transport;
    }

    return transport;
  }

  async connectTransport(
    peerId: string,
    transportId: string,
    dtlsParameters: WebRtcTransport['dtlsParameters']
  ): Promise<void> {
    const peer = this.getPeer(peerId);
    if (!peer) throw new Error('Peer not found');

    const transport =
      peer.sendTransport?.id === transportId
        ? peer.sendTransport
        : peer.recvTransport?.id === transportId
          ? peer.recvTransport
          : undefined;

    if (!transport) throw new Error('Transport not found');
    await transport.connect({ dtlsParameters });
  }

  async produce(
    peerId: string,
    transportId: string,
    kind: 'audio' | 'video',
    rtpParameters: RtpParameters,
    appData?: Record<string, unknown>
  ) {
    const peer = this.getPeer(peerId);
    if (!peer?.sendTransport || peer.sendTransport.id !== transportId) {
      throw new Error('Send transport not found');
    }

    const producer = await peer.sendTransport.produce({
      kind,
      rtpParameters,
      appData: appData ?? {},
    });

    producer.on('transportclose', () => {
      peer.removeProducer(producer.id);
    });

    peer.addProducer(producer);

    if (kind === 'audio') peer.micEnabled = true;
    if (kind === 'video' && appData?.source !== 'screen') peer.cameraEnabled = true;

    this.broadcastToRoom(peerId, 'new-producer', {
      producerId: producer.id,
      peerId,
      kind,
      appData: producer.appData,
    });

    return producer;
  }

  async consume(
    peerId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities
  ) {
    const peer = this.getPeer(peerId);
    if (!peer?.recvTransport) throw new Error('Recv transport not found');

    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume');
    }

    const consumer = await peer.recvTransport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    consumer.on('transportclose', () => {
      peer.removeConsumer(consumer.id);
    });

    consumer.on('producerclose', () => {
      peer.removeConsumer(consumer.id);
      this.io
        ?.to(this.meetingId)
        .emit('producer-closed', { producerId, peerId: this.findPeerByProducer(producerId) });
    });

    peer.addConsumer(consumer);

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  private findPeerByProducer(producerId: string): string | undefined {
    for (const [id, peer] of this.peers) {
      if (peer.producers.has(producerId)) return id;
    }
    return undefined;
  }

  async closeProducer(peerId: string, producerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    const producer = peer?.producers.get(producerId);
    if (producer) {
      producer.close();
      peer!.removeProducer(producerId);
      this.broadcastToRoom(peerId, 'producer-closed', { producerId, peerId });
    }
  }

  getOtherProducers(excludePeerId: string) {
    const list: { producerId: string; peerId: string; kind: string; appData: unknown }[] = [];
    for (const [peerId, peer] of this.peers) {
      if (peerId === excludePeerId) continue;
      for (const producer of peer.producers.values()) {
        list.push({
          producerId: producer.id,
          peerId,
          kind: producer.kind,
          appData: producer.appData,
        });
      }
    }
    return list;
  }

  broadcastToRoom(
    excludePeerId: string,
    event: string,
    payload: unknown
  ): void {
    this.io?.to(this.meetingId).except(excludePeerId).emit(event, payload);
  }

  emitToAll(event: string, payload: unknown): void {
    this.io?.to(this.meetingId).emit(event, payload);
  }

  async close(): Promise<void> {
    for (const peer of [...this.peers.values(), ...this.waitingPeers.values()]) {
      await peer.close();
    }
    this.peers.clear();
    this.waitingPeers.clear();
    this.router.close();
  }
}
