'use client';

import { Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaStore } from '@/store/mediaStore';

export function CameraButton() {
  const { isCameraOn, toggleCamera } = useMediaStore();
  return (
    <Button
      variant={isCameraOn ? 'secondary' : 'destructive'}
      size="icon"
      onClick={toggleCamera}
      title={isCameraOn ? 'Stop video' : 'Start video'}
    >
      {isCameraOn ? (
        <Video className="h-5 w-5" />
      ) : (
        <VideoOff className="h-5 w-5" />
      )}
    </Button>
  );
}
