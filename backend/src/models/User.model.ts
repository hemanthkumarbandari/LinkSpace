import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import type { UserRole } from '../types/shared-types.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  refreshToken?: string;
  enrolledBatches: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
    },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    enrolledBatches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
