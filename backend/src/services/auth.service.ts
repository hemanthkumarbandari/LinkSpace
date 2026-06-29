import { User, IUser } from '../models/User.model.js';
import mongoose from 'mongoose';
import {
  signAccessToken,
  signRefreshToken,
  signGuestAccessToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt.utils.js';
import { AppError } from '../middleware/error.middleware.js';
import { Meeting } from '../models/Meeting.model.js';
import bcrypt from 'bcrypt';

function toPublicUser(user: IUser) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    enrolledBatches: user.enrolledBatches?.map((id) => id.toString()),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
  }
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    role: 'user',
  });
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();
  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password +refreshToken'
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();
  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string) {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid refresh token');
  }
  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user?.refreshToken) {
    throw new AppError(401, 'INVALID_TOKEN', 'Session expired');
  }
  const valid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!valid) {
    throw new AppError(401, 'INVALID_TOKEN', 'Session expired');
  }
  const newPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(newPayload);
  const newRefresh = signRefreshToken(newPayload);
  user.refreshToken = await bcrypt.hash(newRefresh, 10);
  await user.save();
  return { accessToken, refreshToken: newRefresh };
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
}

export async function createGuestSession(displayName: string, meetingId?: string) {
  const name = displayName.trim();
  if (name.length < 1 || name.length > 50) {
    throw new AppError(400, 'INVALID_NAME', 'Display name is required');
  }

  if (meetingId) {
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) throw new AppError(404, 'NOT_FOUND', 'Meeting not found');
    if (meeting.status === 'ended') {
      throw new AppError(400, 'MEETING_ENDED', 'Meeting has ended');
    }
  }

  const guestUserId = new mongoose.Types.ObjectId().toString();
  const accessToken = signGuestAccessToken(guestUserId);

  return {
    accessToken,
    guestUserId,
    displayName: name,
    isGuest: true,
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    enrolledBatches: user.enrolledBatches?.map((id) => id.toString()),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
