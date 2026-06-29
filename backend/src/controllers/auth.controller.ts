import { Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.refresh(req.body.refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user) await authService.logout(req.user.userId);
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await authService.getMe(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function guest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { displayName, meetingId } = req.body as {
      displayName: string;
      meetingId?: string;
    };
    const data = await authService.createGuestSession(displayName, meetingId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
