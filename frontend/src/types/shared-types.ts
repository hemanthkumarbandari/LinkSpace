export type UserRole = 'user' | 'host' | 'admin';
export type MeetingStatus = 'waiting' | 'active' | 'ended';
export type MeetingType = 'instant' | 'scheduled' | 'recurring';
export type ParticipantRole = 'host' | 'co-host' | 'participant';
export type AttendanceStatus = 'present' | 'partial' | 'absent';
export type ChatMessageType = 'text' | 'file' | 'system';
export type RecordingStatus = 'recording' | 'processing' | 'ready' | 'failed';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

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

export interface MeetingSettings {
  waitingRoom: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  muteOnEntry: boolean;
  allowReactions: boolean;
  recordingEnabled: boolean;
  password?: string;
}

export interface Meeting {
  _id: string;
  meetingId: string;
  title: string;
  hostId: string;
  status: MeetingStatus;
  type: MeetingType;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  maxParticipants: number;
  settings: MeetingSettings;
  batchId?: string;
  courseId?: string;
  isRecorded?: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  _id: string;
  meetingId: string;
  userId: string;
  displayName: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt?: string;
  duration?: number;
  micEnabled: boolean;
  cameraEnabled: boolean;
  handRaised: boolean;
  isScreenSharing: boolean;
  socketId?: string;
  peerId?: string;
}

export interface ChatMessage {
  _id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  message: string;
  type: ChatMessageType;
  fileUrl?: string;
  reactions?: { emoji: string; userId: string }[];
  isDeleted: boolean;
  createdAt: string;
}

export interface PeerInfo {
  peerId: string;
  userId: string;
  displayName: string;
  role: ParticipantRole;
  micEnabled: boolean;
  cameraEnabled: boolean;
  handRaised: boolean;
  isScreenSharing: boolean;
  waiting?: boolean;
}

export interface RoomJoinedPayload {
  peers: PeerInfo[];
  rtpCapabilities: unknown;
  peerId: string;
}

export interface NewProducerPayload {
  producerId: string;
  peerId: string;
  kind: 'audio' | 'video';
  appData?: Record<string, unknown>;
}

export interface TransportDirection {
  direction: 'send' | 'recv';
}

