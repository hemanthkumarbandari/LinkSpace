import { create } from 'zustand';

export interface Reaction {
  id: string;
  peerId: string;
  displayName: string;
  emoji: string;
}

interface UiState {
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  layoutMode: 'grid' | 'spotlight' | 'sidebar';
  pinnedPeerId: string | null;
  activeReactions: Reaction[];
  toggleChat: () => void;
  toggleParticipants: () => void;
  setLayout: (mode: 'grid' | 'spotlight' | 'sidebar') => void;
  pinPeer: (peerId: string | null) => void;
  addReaction: (reaction: Omit<Reaction, 'id'>) => void;
  removeReaction: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isChatOpen: false,
  isParticipantsOpen: false,
  layoutMode: 'grid',
  pinnedPeerId: null,
  activeReactions: [],

  toggleChat: () =>
    set((s) => ({
      isChatOpen: !s.isChatOpen,
      isParticipantsOpen: s.isChatOpen ? s.isParticipantsOpen : false,
    })),

  toggleParticipants: () =>
    set((s) => ({
      isParticipantsOpen: !s.isParticipantsOpen,
      isChatOpen: s.isParticipantsOpen ? s.isChatOpen : false,
    })),

  setLayout: (layoutMode) => set({ layoutMode }),
  pinPeer: (pinnedPeerId) => set({ pinnedPeerId }),

  addReaction: (reaction) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((s) => ({
      activeReactions: [...s.activeReactions, { ...reaction, id }],
    }));
    setTimeout(() => get().removeReaction(id), 3000);
  },

  removeReaction: (id) =>
    set((s) => ({
      activeReactions: s.activeReactions.filter((r) => r.id !== id),
    })),
}));
