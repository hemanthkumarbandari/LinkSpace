/**
 * API + Socket URLs without server .env.
 * Edit BACKEND_ORIGIN / HOST_MAP when domains change.
 */

const BACKEND_ORIGIN = 'https://backend-meet.nuhvin.com';

/** Frontends that use the shared backend above (add your hostnames here). */
const FRONTEND_HOSTS_USING_BACKEND = new Set([
  'meet.now.nuhvin.com',
  'www.meet.now.nuhvin.com',
  'meetnow.nuhvin.com',
  'www.meetnow.nuhvin.com',
]);

export interface ResolvedUrls {
  api: string;
  socket: string;
  /** True when browser talks to a different host than the page (use polling-only). */
  crossOriginBackend: boolean;
}

function envOverride(): ResolvedUrls | null {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const socket = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!api && !socket) return null;
  const socketBase = socket ?? (api ? api.replace(/\/api\/?$/, '') : '');
  const apiBase = api ?? `${socketBase}/api`;
  if (!socketBase || !apiBase) return null;
  return {
    api: apiBase,
    socket: socketBase,
    crossOriginBackend: true,
  };
}

function localDevUrls(): ResolvedUrls {
  return {
    api: 'http://localhost:4000/api',
    socket: 'http://localhost:4000',
    crossOriginBackend: true,
  };
}

function productionMappedUrls(): ResolvedUrls {
  return {
    api: `${BACKEND_ORIGIN}/api`,
    socket: BACKEND_ORIGIN,
    crossOriginBackend: true,
  };
}

function sameOriginUrls(origin: string): ResolvedUrls {
  return {
    api: `${origin}/api`,
    socket: origin,
    crossOriginBackend: false,
  };
}

export function resolveUrls(): ResolvedUrls {
  const fromEnv = envOverride();
  if (fromEnv) return fromEnv;

  if (typeof window === 'undefined') {
    return productionMappedUrls();
  }

  const { hostname, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localDevUrls();
  }

  if (FRONTEND_HOSTS_USING_BACKEND.has(hostname)) {
    return productionMappedUrls();
  }

  return sameOriginUrls(origin);
}

export function getApiUrl(): string {
  return resolveUrls().api;
}

export function getSocketUrl(): string {
  return resolveUrls().socket;
}

export function isCrossOriginBackend(): boolean {
  return resolveUrls().crossOriginBackend;
}
