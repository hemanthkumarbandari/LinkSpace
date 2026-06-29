import type { Meeting, MeetingSettings } from '@/types/shared-types';

export type { Meeting, MeetingSettings };

export interface JoinMeetingResponse {
  meeting: Meeting;
  iceServers: RTCIceServer[];
  rtpCapabilities: unknown;
}
