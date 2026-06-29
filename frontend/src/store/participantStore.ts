import { create } from 'zustand';
import type { RemotePeer } from '@/types/participant.types';
import type { PeerInfo } from '@/types/shared-types';

interface ParticipantState {
  peers: Map<string, RemotePeer>;
  localPeer: PeerInfo | null;
  addPeer: (peer: PeerInfo) => void;
  removePeer: (peerId: string) => void;
  updatePeer: (peerId: string, updates: Partial<RemotePeer>) => void;
  setLocalPeer: (peer: PeerInfo | null) => void;
  setPeerStream: (peerId: string, stream: MediaStream | undefined) => void;
  setPeerScreenStream: (peerId: string, stream: MediaStream | undefined) => void;
  reset: () => void;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  peers: new Map(),
  localPeer: null,

  addPeer: (peer) => {
    const peers = new Map(get().peers);
    for (const [id, p] of peers) {
      if (p.userId === peer.userId && id !== peer.peerId) {
        peers.delete(id);
      }
    }
    peers.set(peer.peerId, { ...peer, consumerIds: [] });
    set({ peers });
  },

  removePeer: (peerId) => {
    const peers = new Map(get().peers);
    peers.delete(peerId);
    set({ peers });
  },

  updatePeer: (peerId, updates) => {
    const peers = new Map(get().peers);
    const existing = peers.get(peerId);
    if (existing) peers.set(peerId, { ...existing, ...updates });
    set({ peers });
  },

  setLocalPeer: (localPeer) => set({ localPeer }),

  setPeerStream: (peerId, stream) => {
    const peers = new Map(get().peers);
    const p = peers.get(peerId);
    if (p) peers.set(peerId, { ...p, stream });
    set({ peers });
  },

  setPeerScreenStream: (peerId, stream) => {
    const peers = new Map(get().peers);
    const p = peers.get(peerId);
    if (p) peers.set(peerId, { ...p, screenStream: stream });
    set({ peers });
  },

  reset: () => set({ peers: new Map(), localPeer: null }),
}));
