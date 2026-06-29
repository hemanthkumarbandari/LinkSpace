import { create } from 'zustand';
import type { AvailableDevices, DeviceInfo } from '@/types/media.types';

interface MediaState {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  availableDevices: AvailableDevices;
  setLocalStream: (stream: MediaStream | null) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  setMicOn: (on: boolean) => void;
  setCameraOn: (on: boolean) => void;
  startScreenShare: (stream: MediaStream) => void;
  stopScreenShare: () => void;
  setDevices: (devices: AvailableDevices) => void;
  setSelectedCamera: (id: string) => void;
  setSelectedMic: (id: string) => void;
  setSelectedSpeaker: (id: string) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  localStream: null,
  screenStream: null,
  isMicOn: true,
  isCameraOn: true,
  isScreenSharing: false,
  selectedCamera: '',
  selectedMic: '',
  selectedSpeaker: '',
  availableDevices: { cameras: [], mics: [], speakers: [] },

  setLocalStream: (localStream) => set({ localStream }),

  toggleMic: () => {
    const on = !get().isMicOn;
    get().localStream?.getAudioTracks().forEach((t) => {
      t.enabled = on;
    });
    set({ isMicOn: on });
  },

  toggleCamera: () => {
    const on = !get().isCameraOn;
    get().localStream?.getVideoTracks().forEach((t) => {
      t.enabled = on;
    });
    set({ isCameraOn: on });
  },

  setMicOn: (isMicOn) => {
    get().localStream?.getAudioTracks().forEach((t) => {
      t.enabled = isMicOn;
    });
    set({ isMicOn });
  },

  setCameraOn: (isCameraOn) => {
    get().localStream?.getVideoTracks().forEach((t) => {
      t.enabled = isCameraOn;
    });
    set({ isCameraOn });
  },

  startScreenShare: (screenStream) => set({ screenStream, isScreenSharing: true }),
  stopScreenShare: () => {
    get().screenStream?.getTracks().forEach((t) => t.stop());
    set({ screenStream: null, isScreenSharing: false });
  },

  setDevices: (availableDevices) => set({ availableDevices }),
  setSelectedCamera: (selectedCamera) => set({ selectedCamera }),
  setSelectedMic: (selectedMic) => set({ selectedMic }),
  setSelectedSpeaker: (selectedSpeaker) => set({ selectedSpeaker }),
}));
