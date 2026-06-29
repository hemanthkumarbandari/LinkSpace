import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as recordingService from '../services/recording.service.js';
import { paramId } from '../utils/params.js';
import multer from 'multer';

const uploadRecording = multer({
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
});

export async function start(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await recordingService.startRecording(
      paramId(req, 'meetingId'),
      req.user!.userId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function stop(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await recordingService.stopRecording(
      paramId(req, 'meetingId'),
      req.user!.userId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function list(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await recordingService.listRecordings(paramId(req, 'meetingId'));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function upload(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  uploadRecording.single('file')(req as any, res as any, async (err: any) => {
    if (err) return next(err);
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const durationMsRaw = (req as any).body?.durationMs;
      const durationMs = durationMsRaw ? Number(durationMsRaw) : undefined;

      const data = await recordingService.uploadRecordingFile({
        meetingId: paramId(req, 'meetingId'),
        hostId: req.user!.userId,
        file,
        durationMs,
      });
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  });
}
