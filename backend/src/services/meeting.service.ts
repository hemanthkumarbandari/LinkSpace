import { Meeting, IMeeting } from '../models/Meeting.model.js';
import { Participant } from '../models/Participant.model.js';
import { Attendance } from '../models/Attendance.model.js';
import { ChatMessage } from '../models/ChatMessage.model.js';
import { User } from '../models/User.model.js';
import { generateMeetingId } from '../utils/generateMeetingId.js';
import { AppError } from '../middleware/error.middleware.js';
import { iceServers } from '../config/coturn.config.js';
import { roomManager } from '../mediasoup/RoomManager.js';
import mongoose from 'mongoose';

export async function createMeeting(
  hostId: string,
  data: {
    title?: string;
    type?: string;
    scheduledAt?: string;
    settings?: Partial<IMeeting['settings']>;
    batchId?: string;
    courseId?: string;
  }
) {
  let meetingId = generateMeetingId();
  let exists = await Meeting.findOne({ meetingId });
  while (exists) {
    meetingId = generateMeetingId();
    exists = await Meeting.findOne({ meetingId });
  }

  const meeting = await Meeting.create({
    meetingId,
    title: data.title ?? 'Untitled Meeting',
    hostId: new mongoose.Types.ObjectId(hostId),
    type: data.type ?? 'instant',
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    settings: data.settings ?? {},
    batchId: data.batchId ? new mongoose.Types.ObjectId(data.batchId) : undefined,
    courseId: data.courseId ? new mongoose.Types.ObjectId(data.courseId) : undefined,
    status: 'waiting',
  });

  return formatMeeting(meeting);
}

export async function getMeetingById(meetingId: string) {
  const meeting = await Meeting.findOne({ meetingId }).lean();
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  return formatMeetingLean(meeting);
}

export async function rejoinMeeting(
  meetingId: string,
  userId: string,
  password?: string
) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');

  if (meeting.status === 'ended') {
    if (meeting.hostId.toString() !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Only the host can restart this meeting');
    }
    meeting.status = 'waiting';
    meeting.endedAt = undefined;
    meeting.startedAt = undefined;
    meeting.duration = undefined;
    await meeting.save();
  }

  return joinMeeting(meetingId, userId, password);
}

export async function joinMeeting(
  meetingId: string,
  userId: string,
  password?: string
) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  if (meeting.status === 'ended') {
    throw new AppError(400, 'MEETING_ENDED', 'Meeting has ended');
  }
  if (meeting.settings.password && meeting.settings.password !== password) {
    throw new AppError(403, 'INVALID_PASSWORD', 'Invalid meeting password');
  }

  const room = roomManager.getRoom(meetingId);
  const rtpCapabilities = room?.getRtpCapabilities() ?? null;

  return {
    meeting: formatMeeting(meeting),
    iceServers,
    rtpCapabilities,
  };
}

export async function endMeeting(meetingId: string, hostId: string) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  if (meeting.hostId.toString() !== hostId) {
    throw new AppError(403, 'FORBIDDEN', 'Only host can end meeting');
  }

  meeting.status = 'ended';
  meeting.endedAt = new Date();
  if (meeting.startedAt) {
    meeting.duration = Math.round(
      (meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 60000
    );
  }
  await meeting.save();

  const room = roomManager.getRoom(meetingId);
  room?.emitToAll('meeting-ended', {});

  await roomManager.destroyRoom(meetingId);
  return formatMeeting(meeting);
}

export async function getChatHistory(
  meetingId: string,
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    ChatMessage.find({ meetingId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatMessage.countDocuments({ meetingId, isDeleted: false }),
  ]);
  return {
    messages: messages.reverse().map(formatChat),
    total,
    page,
    limit,
  };
}

export async function getActiveParticipants(meetingId: string) {
  const participants = await Participant.find({
    meetingId,
    leftAt: { $exists: false },
  })
    .populate('userId', 'name email avatar')
    .lean();
  return participants.map((p) => ({
    _id: p._id.toString(),
    meetingId: p.meetingId,
    userId: p.userId.toString(),
    displayName: p.displayName,
    role: p.role,
    joinedAt: p.joinedAt.toISOString(),
    micEnabled: p.micEnabled,
    cameraEnabled: p.cameraEnabled,
    handRaised: p.handRaised,
    isScreenSharing: p.isScreenSharing,
    peerId: p.peerId,
  }));
}

export async function getAttendanceReport(meetingId: string, hostId: string) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  if (meeting.hostId.toString() !== hostId) {
    throw new AppError(403, 'FORBIDDEN', 'Only host can view attendance');
  }
  const records = await Attendance.find({ meetingId }).lean();
  return records.map((r) => ({
    _id: r._id.toString(),
    meetingId: r.meetingId,
    userId: r.userId.toString(),
    totalDuration: r.totalDuration,
    attendancePercentage: r.attendancePercentage,
    status: r.status,
    joinedAt: r.joinedAt?.toISOString(),
    leftAt: r.leftAt?.toISOString(),
  }));
}

export async function getMeetingHistory(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const meetings = await Meeting.find({
    $or: [
      { hostId: new mongoose.Types.ObjectId(userId) },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const participantMeetings = await Participant.find({ userId })
    .distinct('meetingId');

  const allIds = new Set([
    ...meetings.map((m) => m.meetingId),
    ...participantMeetings,
  ]);

  const combined = await Meeting.find({ meetingId: { $in: [...allIds] } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return combined.map(formatMeetingLean);
}

export async function upsertAttendance(
  meetingId: string,
  userId: string,
  joinedAt: Date,
  leftAt: Date,
  batchId?: string,
  courseId?: string
) {
  const meeting = await Meeting.findOne({ meetingId }).lean();
  if (!meeting) return;

  const totalDuration = Math.round((leftAt.getTime() - joinedAt.getTime()) / 1000);
  let meetingDurationSec = 3600;
  if (meeting.startedAt && meeting.endedAt) {
    meetingDurationSec = Math.round(
      (meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 1000
    );
  } else if (meeting.startedAt) {
    meetingDurationSec = Math.round(
      (Date.now() - meeting.startedAt.getTime()) / 1000
    );
  }

  const pct =
    meetingDurationSec > 0
      ? Math.min(100, (totalDuration / meetingDurationSec) * 100)
      : 0;

  let status: 'present' | 'partial' | 'absent' = 'absent';
  if (pct >= 80) status = 'present';
  else if (pct > 0) status = 'partial';

  await Attendance.findOneAndUpdate(
    { meetingId, userId: new mongoose.Types.ObjectId(userId) },
    {
      meetingId,
      userId: new mongoose.Types.ObjectId(userId),
      batchId: batchId
        ? new mongoose.Types.ObjectId(batchId)
        : meeting.batchId,
      courseId: courseId
        ? new mongoose.Types.ObjectId(courseId)
        : meeting.courseId,
      sessionDate: meeting.startedAt ?? new Date(),
      joinedAt,
      leftAt,
      totalDuration,
      attendancePercentage: Math.round(pct),
      status,
    },
    { upsert: true, new: true }
  );
}

function formatMeeting(m: IMeeting) {
  return {
    _id: m._id.toString(),
    meetingId: m.meetingId,
    title: m.title,
    hostId: m.hostId.toString(),
    status: m.status,
    type: m.type,
    scheduledAt: m.scheduledAt?.toISOString(),
    startedAt: m.startedAt?.toISOString(),
    endedAt: m.endedAt?.toISOString(),
    duration: m.duration,
    maxParticipants: m.maxParticipants,
    settings: m.settings,
    batchId: m.batchId?.toString(),
    courseId: m.courseId?.toString(),
    isRecorded: m.isRecorded,
    recordingUrl: m.recordingUrl,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

function formatMeetingLean(m: Record<string, unknown> & { _id: mongoose.Types.ObjectId; hostId: mongoose.Types.ObjectId }) {
  return {
    _id: m._id.toString(),
    meetingId: m.meetingId,
    title: m.title,
    hostId: m.hostId.toString(),
    status: m.status,
    type: m.type,
    scheduledAt: (m.scheduledAt as Date)?.toISOString(),
    startedAt: (m.startedAt as Date)?.toISOString(),
    endedAt: (m.endedAt as Date)?.toISOString(),
    duration: m.duration,
    maxParticipants: m.maxParticipants,
    settings: m.settings,
    batchId: (m.batchId as mongoose.Types.ObjectId)?.toString(),
    courseId: (m.courseId as mongoose.Types.ObjectId)?.toString(),
    isRecorded: m.isRecorded,
    recordingUrl: m.recordingUrl,
    createdAt: (m.createdAt as Date).toISOString(),
    updatedAt: (m.updatedAt as Date).toISOString(),
  };
}

function formatChat(m: Record<string, unknown> & { _id: mongoose.Types.ObjectId; senderId: mongoose.Types.ObjectId }) {
  return {
    _id: m._id.toString(),
    meetingId: m.meetingId,
    senderId: m.senderId.toString(),
    senderName: m.senderName,
    message: m.message,
    type: m.type,
    fileUrl: m.fileUrl,
    reactions: m.reactions,
    isDeleted: m.isDeleted,
    createdAt: (m.createdAt as Date).toISOString(),
  };
}
