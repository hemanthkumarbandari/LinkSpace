import mongoose, { Schema, Document } from 'mongoose';
import type { MeetingStatus, MeetingType } from '../types/shared-types.js';

export interface IMeetingSettings {
  waitingRoom: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  muteOnEntry: boolean;
  allowReactions: boolean;
  recordingEnabled: boolean;
  password?: string;
}

export interface IMeeting extends Document {
  meetingId: string;
  title: string;
  hostId: mongoose.Types.ObjectId;
  status: MeetingStatus;
  type: MeetingType;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  maxParticipants: number;
  settings: IMeetingSettings;
  batchId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  isRecorded: boolean;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSettingsSchema = new Schema<IMeetingSettings>(
  {
    waitingRoom: { type: Boolean, default: false },
    allowChat: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: true },
    muteOnEntry: { type: Boolean, default: false },
    allowReactions: { type: Boolean, default: true },
    recordingEnabled: { type: Boolean, default: true },
    password: { type: String },
  },
  { _id: false }
);

const meetingSchema = new Schema<IMeeting>(
  {
    meetingId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'Untitled Meeting' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended'],
      default: 'waiting',
    },
    type: {
      type: String,
      enum: ['instant', 'scheduled', 'recurring'],
      default: 'instant',
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number },
    maxParticipants: { type: Number, default: 50 },
    settings: { type: meetingSettingsSchema, default: () => ({}) },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    isRecorded: { type: Boolean, default: false },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

meetingSchema.index({ hostId: 1 });
meetingSchema.index({ createdAt: -1 });
meetingSchema.index({ status: 1 });

export const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);
