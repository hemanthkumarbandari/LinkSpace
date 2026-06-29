const BACKEND_ORIGIN = 'https://backend-meet.nuhvin.com';

const ADMIN_HOSTS_USING_BACKEND = new Set([
  'meet.now.nuhvin.com',
  'www.meet.now.nuhvin.com',
  'meetnow.nuhvin.com',
  'www.meetnow.nuhvin.com',
  'admin.meet.now.nuhvin.com',
]);

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
    if (ADMIN_HOSTS_USING_BACKEND.has(hostname)) {
      return `${BACKEND_ORIGIN}/api`;
    }
    return `${origin}/api`;
  }

  return `${BACKEND_ORIGIN}/api`;
}
