import Bull from 'bull';
import { env } from '../config/env.config.js';
import { Recording } from '../models/Recording.model.js';
import { Meeting } from '../models/Meeting.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const recordingQueue = new Bull('recording', env.REDIS_URL);

recordingQueue.process('process-recording', async (job) => {
  const { recordingId } = job.data as { recordingId: string };
  const recording = await Recording.findById(recordingId);
  if (!recording) return;

  await Recording.findByIdAndUpdate(recordingId, { status: 'processing' });
  logger.info('Recording stub: processing (FFmpeg pipeline not configured)', {
    recordingId,
  });

  await new Promise((r) => setTimeout(r, 2000));

  await Recording.findByIdAndUpdate(recordingId, {
    status: 'ready',
    fileUrl: `/recordings/placeholder/${recording.meetingId}.mp4`,
    duration: 0,
    size: 0,
  });

  await Meeting.findOneAndUpdate(
    { meetingId: recording.meetingId },
    {
      isRecorded: true,
      recordingUrl: `/recordings/placeholder/${recording.meetingId}.mp4`,
    }
  );
});

export async function startRecording(meetingId: string, hostId: string) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  if (meeting.hostId.toString() !== hostId) {
    throw new AppError(403, 'FORBIDDEN', 'Only host can start recording');
  }
  // Auto-enable recording for older meetings created before recording was enabled by default.
  if (!meeting.settings.recordingEnabled) {
    meeting.settings.recordingEnabled = true;
    await meeting.save();
  }

  const existing = await Recording.findOne({
    meetingId,
    status: { $in: ['recording', 'processing'] },
  });
  if (existing) {
    return formatRecording(existing);
  }

  const recording = await Recording.create({
    meetingId,
    hostId: new mongoose.Types.ObjectId(hostId),
    status: 'recording',
    batchId: meeting.batchId,
    courseId: meeting.courseId,
  });

  await recordingQueue.add('process-recording', {
    recordingId: recording._id.toString(),
  }, { delay: 5000 });

  return formatRecording(recording);
}

export async function stopRecording(meetingId: string, hostId: string) {
  const recording = await Recording.findOne({
    meetingId,
    status: 'recording',
  });
  if (!recording) throw new AppError(404, 'NOT_FOUND', 'No active recording');
  if (recording.hostId.toString() !== hostId) {
    throw new AppError(403, 'FORBIDDEN', 'Only host can stop recording');
  }

  await recordingQueue.add('process-recording', {
    recordingId: recording._id.toString(),
  });

  return formatRecording(recording);
}

export async function listRecordings(meetingId: string) {
  const recordings = await Recording.find({ meetingId }).lean();
  return recordings.map((r) => ({
    _id: r._id.toString(),
    meetingId: r.meetingId,
    hostId: r.hostId.toString(),
    fileUrl: r.fileUrl,
    duration: r.duration,
    size: r.size,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function uploadRecordingFile(args: {
  meetingId: string;
  hostId: string;
  file?: Express.Multer.File;
  durationMs?: number;
}) {
  const { meetingId, hostId, file, durationMs } = args;
  if (!file) throw new AppError(400, 'NO_FILE', 'Missing recording file');

  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  if (meeting.hostId.toString() !== hostId) {
    throw new AppError(403, 'FORBIDDEN', 'Only host can upload recording');
  }
  // Auto-enable recording for older meetings created before recording was enabled by default.
  if (!meeting.settings.recordingEnabled) {
    meeting.settings.recordingEnabled = true;
    await meeting.save();
  }

  const recording = await Recording.findOne({
    meetingId,
    hostId: new mongoose.Types.ObjectId(hostId),
    status: { $in: ['recording', 'processing'] },
  }).sort({ createdAt: -1 });

  if (!recording) {
    throw new AppError(404, 'NOT_FOUND', 'No active recording session');
  }

  const ext = guessExtension(file.mimetype) ?? 'webm';
  const safeId = crypto.randomBytes(8).toString('hex');
  const filename = `${meetingId}-${recording._id.toString()}-${safeId}.${ext}`;

  const recordingsDir = path.join(process.cwd(), 'uploads', 'recordings');
  await fs.mkdir(recordingsDir, { recursive: true });
  const absPath = path.join(recordingsDir, filename);
  await fs.writeFile(absPath, file.buffer);

  const fileUrl = `/recordings/${filename}`;
  const durationSeconds =
    typeof durationMs === 'number' && Number.isFinite(durationMs)
      ? Math.max(0, Math.round(durationMs / 1000))
      : undefined;

  recording.status = 'ready';
  recording.filePath = absPath;
  recording.fileUrl = fileUrl;
  recording.size = file.size;
  if (typeof durationSeconds === 'number') recording.duration = durationSeconds;
  await recording.save();

  await Meeting.findOneAndUpdate(
    { meetingId },
    { isRecorded: true, recordingUrl: fileUrl }
  );

  logger.info('Recording uploaded', {
    meetingId,
    recordingId: recording._id.toString(),
    size: file.size,
    fileUrl,
  });

  return formatRecording(recording);
}

function formatRecording(r: { _id: mongoose.Types.ObjectId; meetingId: string; hostId: mongoose.Types.ObjectId; fileUrl?: string; duration?: number; size?: number; status: string; createdAt: Date }) {
  return {
    _id: r._id.toString(),
    meetingId: r.meetingId,
    hostId: r.hostId.toString(),
    fileUrl: r.fileUrl,
    duration: r.duration,
    size: r.size,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

function guessExtension(mime: string | undefined): string | undefined {
  if (!mime) return undefined;
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('ogg')) return 'ogg';
  return undefined;
}
