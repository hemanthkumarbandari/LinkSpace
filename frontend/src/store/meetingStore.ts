import { create } from 'zustand';
import type { Meeting } from '@/types/shared-types';

type MeetingStatus = 'idle' | 'connecting' | 'connected' | 'ended' | 'waiting';

interface MeetingState {
  meeting: Meeting | null;
  status: MeetingStatus;
  localPeerId: string | null;
  setMeeting: (meeting: Meeting | null) => void;
  setStatus: (status: MeetingStatus) => void;
  setLocalPeerId: (id: string | null) => void;
  endMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  meeting: null,
  status: 'idle',
  localPeerId: null,
  setMeeting: (meeting) => set({ meeting }),
  setStatus: (status) => set({ status }),
  setLocalPeerId: (localPeerId) => set({ localPeerId }),
  endMeeting: () => set({ status: 'ended' }),
}));
