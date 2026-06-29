import mongoose, { Schema, Document } from 'mongoose';
import type { AttendanceStatus } from '../types/shared-types.js';

export interface IAttendance extends Document {
  meetingId: string;
  userId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  sessionDate: Date;
  joinedAt?: Date;
  leftAt?: Date;
  totalDuration: number;
  attendancePercentage: number;
  status: AttendanceStatus;
  markedBy?: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    meetingId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    sessionDate: { type: Date, default: Date.now },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    totalDuration: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'partial', 'absent'],
      default: 'absent',
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ meetingId: 1, userId: 1 }, { unique: true });
attendanceSchema.index({ batchId: 1, sessionDate: -1 });

export const Attendance = mongoose.model<IAttendance>(
  'Attendance',
  attendanceSchema
);
