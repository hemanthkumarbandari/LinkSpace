export type UserRole = 'user' | 'host' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  enrolledBatches?: string[];
  createdAt: string;
  updatedAt: string;
}

