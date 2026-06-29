import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

/** Short-lived token for guests joining a meeting without an account. */
export function signGuestAccessToken(guestId: string): string {
  const payload: TokenPayload = {
    userId: guestId,
    email: `guest-${guestId}@guest.local`,
    role: 'guest',
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '12h',
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
