import type { PeerInfo, ChatMessage } from '@/types/shared-types';

export interface ExistingProducer {
  producerId: string;
  peerId: string;
  kind: string;
  appData?: unknown;
}

export interface RoomJoinedEvent {
  peers: PeerInfo[];
  rtpCapabilities: unknown;
  peerId: string;
  role?: PeerInfo['role'];
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  waiting?: boolean;
  existingProducers?: ExistingProducer[];
}

export interface NewProducerEvent {
  producerId: string;
  peerId: string;
  kind: 'audio' | 'video';
  appData?: Record<string, unknown>;
}

export interface SocketErrorEvent {
  code: string;
  message: string;
}

export interface NewMessageEvent {
  message: ChatMessage;
}

export interface ReactionEvent {
  peerId: string;
  displayName: string;
  emoji: string;
}
