import { api } from './api';
import type { Meeting } from '@/types/shared-types';
import type { JoinMeetingResponse } from '@/types/meeting.types';
import type { ChatMessage } from '@/types/chat.types';

export const meetingService = {
  create: (data: {
    title?: string;
    type?: string;
    scheduledAt?: string;
    settings?: Record<string, boolean | string>;
  }) => api.post<{ success: boolean; data: Meeting }>('/meetings', data),

  getById: (meetingId: string) =>
    api.get<{ success: boolean; data: Meeting }>(`/meetings/${meetingId}`),

  join: (meetingId: string, password?: string) =>
    api.post<{ success: boolean; data: JoinMeetingResponse }>(
      `/meetings/${meetingId}/join`,
      { password }
    ),

  rejoin: (meetingId: string, password?: string) =>
    api.post<{ success: boolean; data: JoinMeetingResponse }>(
      `/meetings/${meetingId}/rejoin`,
      { password }
    ),

  end: (meetingId: string) =>
    api.patch<{ success: boolean; data: Meeting }>(`/meetings/${meetingId}/end`),

  getChat: (meetingId: string, page = 1) =>
    api.get<{
      success: boolean;
      data: { messages: ChatMessage[]; total: number };
    }>(`/meetings/${meetingId}/chat`, { params: { page } }),

  getParticipants: (meetingId: string) =>
    api.get<{ success: boolean; data: unknown[] }>(
      `/meetings/${meetingId}/participants`
    ),

  getHistory: () =>
    api.get<{ success: boolean; data: Meeting[] }>('/meetings/history'),
};
