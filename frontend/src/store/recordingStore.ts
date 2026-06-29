import { create } from 'zustand';

interface RecordingState {
  isRecording: boolean;
  isUploading: boolean;
  setRecording: (v: boolean) => void;
  setUploading: (v: boolean) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isUploading: false,
  setRecording: (v) => set({ isRecording: v }),
  setUploading: (v) => set({ isUploading: v }),
  reset: () => set({ isRecording: false, isUploading: false }),
}));

