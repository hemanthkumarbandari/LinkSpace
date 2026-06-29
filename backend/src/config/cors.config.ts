import { env } from './env.config.js';

const PRODUCTION_ORIGINS = [
  'https://meetnow.nuhvin.com',
  'https://www.meetnow.nuhvin.com',
  'https://admin-meet.nuhvin.com',
  'https://backend-meet.nuhvin.com',
];

/** Origins allowed for REST and Socket.IO (browser requests). */
export function getAllowedOrigins(): Set<string> {
  const origins = new Set([env.FRONTEND_URL, env.ADMIN_URL, ...PRODUCTION_ORIGINS]);

  if (env.CORS_ORIGINS) {
    for (const o of env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)) {
      origins.add(o);
    }
  }

  return origins;
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.has(origin)) return true;

  if (origin.startsWith('https://lms-frontend-9ggk') && origin.endsWith('.vercel.app')) {
    return true;
  }

  try {
    const url = new URL(origin);
    if (url.protocol === 'https:' && url.hostname.endsWith('.nuhvin.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

/** Value for Access-Control-Allow-Origin (must be exact origin when using credentials). */
export function resolveCorsOrigin(origin: string | undefined): string | boolean {
  if (!origin) return true;
  if (isOriginAllowed(origin)) return origin;
  return false;
}
