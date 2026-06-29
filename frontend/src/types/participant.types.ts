import type { PeerInfo } from '@/types/shared-types';

export type { PeerInfo };

export interface LocalPeer extends PeerInfo {
  isLocal: true;
}

export interface RemotePeer extends PeerInfo {
  isLocal?: false;
  stream?: MediaStream;
  screenStream?: MediaStream;
  consumerIds?: string[];
}
