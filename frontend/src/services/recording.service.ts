import { api } from './api';

export const recordingService = {
  start: (meetingId: string) =>
    api.post<{ success: boolean; data: { _id: string } }>(
      `/recordings/${meetingId}/start`
    ),

  upload: (meetingId: string, file: Blob, durationMs?: number) => {
    const form = new FormData();
    form.append('file', file, 'recording.webm');
    if (typeof durationMs === 'number') form.append('durationMs', String(durationMs));
    return api.post<{ success: boolean; data: unknown }>(
      `/recordings/${meetingId}/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  list: (meetingId: string) =>
    api.get<{ success: boolean; data: unknown }>(`/recordings/${meetingId}`),
};

