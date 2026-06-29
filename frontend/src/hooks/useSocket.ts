'use client';

import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getMeetingSocket, disconnectSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';

export function useSocket(enabled = true) {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!enabled || !accessToken) return;
    socketRef.current = getMeetingSocket(accessToken);
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [enabled, accessToken]);

  return socketRef;
}
