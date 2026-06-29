import mongoose, { Schema, Document } from 'mongoose';
import type { ChatMessageType } from '../types/shared-types.js';

export interface IChatMessage extends Document {
  meetingId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  message: string;
  type: ChatMessageType;
  fileUrl?: string;
  reactions: { emoji: string; userId: mongoose.Types.ObjectId }[];
  isDeleted: boolean;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    meetingId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    fileUrl: { type: String },
    reactions: [
      {
        emoji: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ meetingId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<IChatMessage>(
  'ChatMessage',
  chatMessageSchema
);
