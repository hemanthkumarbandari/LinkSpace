'use client';

import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaStore } from '@/store/mediaStore';

export function MicButton() {
  const { isMicOn, toggleMic } = useMediaStore();
  return (
    <Button
      variant={isMicOn ? 'secondary' : 'destructive'}
      size="icon"
      onClick={toggleMic}
      title={isMicOn ? 'Mute' : 'Unmute'}
    >
      {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
    </Button>
  );
}
