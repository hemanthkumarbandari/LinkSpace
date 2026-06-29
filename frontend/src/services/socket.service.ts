import { io, Socket } from 'socket.io-client';
import { getSocketUrl, isCrossOriginBackend } from '@/config/urls';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getMeetingSocket(token: string): Socket {
  if (socket && currentToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  const socketUrl = getSocketUrl();
  const crossOrigin = isCrossOriginBackend();

  // Split frontend/backend hosts: polling only (no nginx WebSocket required).
  socket = io(`${socketUrl}/meeting`, {
    auth: { token },
    path: '/socket.io',
    transports: crossOrigin ? ['polling'] : ['polling', 'websocket'],
    upgrade: !crossOrigin,
    reconnection: true,
    reconnectionAttempts: 15,
    timeout: 20000,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function waitUntilSocketConnected(sock: Socket, timeoutMs = 25000): Promise<void> {
  if (sock.connected) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          `Cannot reach meeting server at ${getSocketUrl()}. Check backend is running.`
        )
      );
    }, timeoutMs);

    const onConnect = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timer);
      sock.off('connect', onConnect);
    };

    sock.on('connect', onConnect);
    if (!sock.active) sock.connect();
  });
}
