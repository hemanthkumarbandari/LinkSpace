import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as meetingService from '../services/meeting.service.js';
import { paramId } from '../utils/params.js';

export async function create(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.createMeeting(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.getMeetingById(paramId(req, 'meetingId'));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function join(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.joinMeeting(
      paramId(req, 'meetingId'),
      req.user!.userId,
      req.body.password
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function rejoin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.rejoinMeeting(
      paramId(req, 'meetingId'),
      req.user!.userId,
      req.body.password
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function end(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.endMeeting(
      paramId(req, 'meetingId'),
      req.user!.userId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function chat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const data = await meetingService.getChatHistory(
      paramId(req, 'meetingId'),
      page,
      limit
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function participants(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.getActiveParticipants(paramId(req, 'meetingId'));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function attendance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await meetingService.getAttendanceReport(
      paramId(req, 'meetingId'),
      req.user!.userId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function history(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await meetingService.getMeetingHistory(
      req.user!.userId,
      page,
      limit
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
