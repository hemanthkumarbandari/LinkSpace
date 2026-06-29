'use client';

import { useEffect, useCallback } from 'react';
import { useMediaStore } from '@/store/mediaStore';

export function useDevices() {
  const { setDevices, setSelectedCamera, setSelectedMic, availableDevices } =
    useMediaStore();

  const enumerate = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: true,
      });
    } catch {
      // permission may be denied
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices
      .filter((d) => d.kind === 'videoinput')
      .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Camera' }));
    const mics = devices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Microphone' }));
    const speakers = devices
      .filter((d) => d.kind === 'audiooutput')
      .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Speaker' }));

    setDevices({ cameras, mics, speakers });
    if (cameras[0]) setSelectedCamera(cameras[0].deviceId);
    if (mics[0]) setSelectedMic(mics[0].deviceId);
  }, [setDevices, setSelectedCamera, setSelectedMic]);

  useEffect(() => {
    enumerate();
    navigator.mediaDevices.addEventListener('devicechange', enumerate);
    return () =>
      navigator.mediaDevices.removeEventListener('devicechange', enumerate);
  }, [enumerate]);

  return { availableDevices, refreshDevices: enumerate };
}
