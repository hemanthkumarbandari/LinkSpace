'use client';

import { useCallback } from 'react';
import { useMediaStore } from '@/store/mediaStore';

export function useLocalStream() {
  const {
    localStream,
    setLocalStream,
    selectedCamera,
    selectedMic,
    isMicOn,
    isCameraOn,
  } = useMediaStore();

  const startPreview = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: selectedCamera
        ? { deviceId: { exact: selectedCamera } }
        : true,
      audio: selectedMic
        ? {
            deviceId: { exact: selectedMic },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
    });
    stream.getAudioTracks().forEach((t) => {
      t.enabled = isMicOn;
    });
    stream.getVideoTracks().forEach((t) => {
      t.enabled = isCameraOn;
    });
    const prev = useMediaStore.getState().localStream;
    prev?.getTracks().forEach((t) => t.stop());
    setLocalStream(stream);
    return stream;
  }, [selectedCamera, selectedMic, isMicOn, isCameraOn, setLocalStream]);

  const stopPreview = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
  }, [localStream, setLocalStream]);

  return { localStream, startPreview, stopPreview };
}
