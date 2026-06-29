/** Decode JWT payload (no signature verify — client-side expiry check only). */
export function getJwtExpiryMs(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    if (typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

/** True if token is expired or expires within `skewMs` (default 60s). */
export function isAccessTokenStale(token: string | null, skewMs = 60_000): boolean {
  if (!token) return true;
  const exp = getJwtExpiryMs(token);
  if (exp === null) return true;
  return Date.now() >= exp - skewMs;
}
