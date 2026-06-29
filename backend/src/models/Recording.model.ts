import mongoose, { Schema, Document } from 'mongoose';
import type { RecordingStatus } from '../types/shared-types.js';

export interface IRecording extends Document {
  meetingId: string;
  hostId: mongoose.Types.ObjectId;
  filePath?: string;
  fileUrl?: string;
  duration?: number;
  size?: number;
  status: RecordingStatus;
  batchId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const recordingSchema = new Schema<IRecording>(
  {
    meetingId: { type: String, required: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filePath: { type: String },
    fileUrl: { type: String },
    duration: { type: Number },
    size: { type: Number },
    status: {
      type: String,
      enum: ['recording', 'processing', 'ready', 'failed'],
      default: 'recording',
    },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

recordingSchema.index({ meetingId: 1, createdAt: -1 });

export const Recording = mongoose.model<IRecording>(
  'Recording',
  recordingSchema
);
