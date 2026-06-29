import { api } from './api';
import type { User } from '@/types/shared-types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    ),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ success: boolean; data: User }>('/auth/me'),

  createGuest: (data: { displayName: string; meetingId?: string }) =>
    api.post<{
      success: boolean;
      data: {
        accessToken: string;
        guestUserId: string;
        displayName: string;
        isGuest: boolean;
      };
    }>('/auth/guest', data),
};
