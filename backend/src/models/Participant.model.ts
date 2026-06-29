import mongoose, { Schema, Document } from 'mongoose';
import type { ParticipantRole } from '../types/shared-types.js';

export interface IParticipant extends Document {
  meetingId: string;
  userId: mongoose.Types.ObjectId;
  displayName: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
  micEnabled: boolean;
  cameraEnabled: boolean;
  handRaised: boolean;
  isScreenSharing: boolean;
  socketId?: string;
  peerId?: string;
}

const participantSchema = new Schema<IParticipant>(
  {
    meetingId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    role: {
      type: String,
      enum: ['host', 'co-host', 'participant'],
      default: 'participant',
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    duration: { type: Number },
    micEnabled: { type: Boolean, default: true },
    cameraEnabled: { type: Boolean, default: true },
    handRaised: { type: Boolean, default: false },
    isScreenSharing: { type: Boolean, default: false },
    socketId: { type: String },
    peerId: { type: String },
  },
  { timestamps: false }
);

participantSchema.index({ meetingId: 1, userId: 1 });
participantSchema.index({ meetingId: 1, leftAt: 1 });

export const Participant = mongoose.model<IParticipant>(
  'Participant',
  participantSchema
);
