import { Meeting } from '../models/Meeting.model.js';
import { User } from '../models/User.model.js';
import { Participant } from '../models/Participant.model.js';
import { Attendance } from '../models/Attendance.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { roomManager } from '../mediasoup/RoomManager.js';
import * as meetingService from './meeting.service.js';
import mongoose from 'mongoose';

export async function getAllMeetings(
  page = 1,
  limit = 20,
  status?: string
): Promise<{ meetings: Record<string, unknown>[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [meetings, total] = await Promise.all([
    Meeting.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Meeting.countDocuments(filter),
  ]);

  const enriched = await Promise.all(
    meetings.map(async (m) => {
      const count = await Participant.countDocuments({
        meetingId: m.meetingId,
        leftAt: { $exists: false },
      });
      const room = roomManager.getRoom(m.meetingId);
      return {
        ...m,
        _id: m._id.toString(),
        hostId: m.hostId.toString(),
        activeParticipants: room?.getPeerCount() ?? count,
      };
    })
  );

  return { meetings: enriched, total, page, limit };
}

export async function getAllUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select('-password -refreshToken').skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);
  return {
    users: users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}

export async function changeUserRole(userId: string, role: string) {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('-password -refreshToken');
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function forceEndMeeting(meetingId: string) {
  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
  return meetingService.endMeeting(meetingId, meeting.hostId.toString());
}

export async function getStats() {
  const [totalUsers, totalMeetings, activeMeetings] = await Promise.all([
    User.countDocuments(),
    Meeting.countDocuments(),
    Meeting.countDocuments({ status: 'active' }),
  ]);

  const durationAgg = await Meeting.aggregate([
    { $match: { duration: { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$duration' } } },
  ]);

  const meetingsPerDay = await Meeting.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalUsers,
    totalMeetings,
    activeMeetings,
    totalDurationMinutes: durationAgg[0]?.total ?? 0,
    meetingsPerDay,
  };
}

export async function getMeetingReport(
  meetingId: string
): Promise<Record<string, unknown>> {
  const meeting = await Meeting.findOne({ meetingId }).lean();
  if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');

  const [participants, attendance, host] = await Promise.all([
    Participant.find({ meetingId }).lean(),
    Attendance.find({ meetingId }).lean(),
    User.findById(meeting.hostId).select('name email').lean(),
  ]);

  return {
    meeting: {
      ...meeting,
      _id: meeting._id.toString(),
      hostId: meeting.hostId.toString(),
    },
    host,
    participants,
    attendance,
  };
}

export async function getAnalytics() {
  const peakHours = await Meeting.aggregate([
    { $match: { startedAt: { $exists: true } } },
    { $group: { _id: { $hour: '$startedAt' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const avgDuration = await Meeting.aggregate([
    { $match: { duration: { $exists: true, $gt: 0 } } },
    { $group: { _id: null, avg: { $avg: '$duration' } } },
  ]);

  const topHosts = await Meeting.aggregate([
    { $group: { _id: '$hostId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'host',
      },
    },
  ]);

  return {
    peakHours,
    averageDurationMinutes: avgDuration[0]?.avg ?? 0,
    topHosts,
  };
}
