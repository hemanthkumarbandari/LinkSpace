'use client';

import { Smile } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmojiPicker } from '@/components/reactions/EmojiPicker';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';

interface ReactionsButtonProps {
  meetingId: string;
}

export function ReactionsButton({ meetingId }: ReactionsButtonProps) {
  const [open, setOpen] = useState(false);
  const getMeetingAccessToken = useAuthStore((s) => s.getMeetingAccessToken);

  const send = (emoji: string) => {
    getMeetingSocket(getMeetingAccessToken() ?? '').emit('send-reaction', { meetingId, emoji });
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="secondary" size="icon" onClick={() => setOpen(!open)}>
        <Smile className="h-5 w-5" />
      </Button>
      {open && <EmojiPicker onSelect={send} onClose={() => setOpen(false)} />}
    </div>
  );
}
