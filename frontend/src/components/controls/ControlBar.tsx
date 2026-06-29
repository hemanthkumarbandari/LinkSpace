'use client';

import { MicButton } from './MicButton';
import { CameraButton } from './CameraButton';
import { ScreenShareButton } from './ScreenShareButton';
import { RaiseHandButton } from './RaiseHandButton';
import { ReactionsButton } from './ReactionsButton';
import { ChatButton } from './ChatButton';
import { ParticipantsButton } from './ParticipantsButton';
import { LeaveButton } from './LeaveButton';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';

interface ControlBarProps {
  meetingId: string;
  onLeave?: () => void;
}

function ControlCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 shadow-sm">
      {children}
    </div>
  );
}

export function ControlBar({ meetingId, onLeave }: ControlBarProps) {
  const getMeetingAccessToken = useAuthStore((s) => s.getMeetingAccessToken);

  const raiseHand = () => {
    getMeetingSocket(getMeetingAccessToken() ?? '').emit('raise-hand', { meetingId });
  };

  const lowerHand = () => {
    getMeetingSocket(getMeetingAccessToken() ?? '').emit('lower-hand', { meetingId });
  };

  return (
    <footer className="flex items-center justify-between border-t border-sky-100 bg-sky-50/80 px-6 py-4 backdrop-blur">
      <ControlCard>
        <MicButton />
        <CameraButton />
      </ControlCard>
      <ControlCard>
        <ScreenShareButton meetingId={meetingId} />
        <RaiseHandButton onRaise={raiseHand} onLower={lowerHand} />
        <ReactionsButton meetingId={meetingId} />
        <ChatButton />
        <ParticipantsButton />
      </ControlCard>
      <ControlCard>
        <LeaveButton meetingId={meetingId} onLeave={onLeave} />
      </ControlCard>
    </footer>
  );
}
