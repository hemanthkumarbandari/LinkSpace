import type {
  WebRtcTransport,
  Producer,
  Consumer,
  MediaKind,
} from 'mediasoup/types';
import type { ParticipantRole } from '../types/shared-types.js';

export class Peer {
  public sendTransport?: WebRtcTransport;
  public recvTransport?: WebRtcTransport;
  public readonly producers = new Map<string, Producer>();
  public readonly consumers = new Map<string, Consumer>();
  public micEnabled = true;
  public cameraEnabled = true;
  public handRaised = false;
  public isScreenSharing = false;
  public inWaitingRoom = false;

  constructor(
    public readonly peerId: string,
    public readonly userId: string,
    public displayName: string,
    public role: ParticipantRole,
    public socketId: string
  ) {}

  addProducer(producer: Producer): void {
    this.producers.set(producer.id, producer);
    if (producer.appData?.source === 'screen') {
      this.isScreenSharing = true;
    }
  }

  removeProducer(producerId: string): void {
    const producer = this.producers.get(producerId);
    if (producer?.appData?.source === 'screen') {
      this.isScreenSharing = false;
    }
    this.producers.delete(producerId);
  }

  addConsumer(consumer: Consumer): void {
    this.consumers.set(consumer.id, consumer);
  }

  removeConsumer(consumerId: string): void {
    this.consumers.delete(consumerId);
  }

  getProducerIds(): string[] {
    return Array.from(this.producers.keys());
  }

  toInfo() {
    return {
      peerId: this.peerId,
      userId: this.userId,
      displayName: this.displayName,
      role: this.role,
      micEnabled: this.micEnabled,
      cameraEnabled: this.cameraEnabled,
      handRaised: this.handRaised,
      isScreenSharing: this.isScreenSharing,
      waiting: this.inWaitingRoom,
    };
  }

  async close(): Promise<void> {
    for (const producer of this.producers.values()) {
      producer.close();
    }
    for (const consumer of this.consumers.values()) {
      consumer.close();
    }
    this.sendTransport?.close();
    this.recvTransport?.close();
    this.producers.clear();
    this.consumers.clear();
  }
}

export type { MediaKind };
