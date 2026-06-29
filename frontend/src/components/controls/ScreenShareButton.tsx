'use client';

import { MonitorUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediasoup } from '@/hooks/useMediasoup';
import { useMediaStore } from '@/store/mediaStore';

interface ScreenShareButtonProps {
  meetingId: string;
}

export function ScreenShareButton({ meetingId }: ScreenShareButtonProps) {
  const { startScreenShare } = useMediasoup(meetingId);
  const isScreenSharing = useMediaStore((s) => s.isScreenSharing);

  return (
    <Button
      variant={isScreenSharing ? 'default' : 'secondary'}
      size="icon"
      onClick={() => void startScreenShare()}
      title="Share screen"
    >
      <MonitorUp className="h-5 w-5" />
    </Button>
  );
}
