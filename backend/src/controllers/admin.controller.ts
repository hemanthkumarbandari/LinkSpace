import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as adminService from '../services/admin.service.js';
import { paramId } from '../utils/params.js';

export async function meetings(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const data = await adminService.getAllMeetings(page, limit, status);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function users(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await adminService.getAllUsers(page, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function changeRole(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.changeUserRole(paramId(req, 'id'), req.body.role);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function forceEnd(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.forceEndMeeting(paramId(req, 'id'));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function stats(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function report(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.getMeetingReport(paramId(req, 'id'));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function analytics(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await adminService.getAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
