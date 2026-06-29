'use client';

import { useRouter } from 'next/navigation';
import { PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { disconnectSocket } from '@/services/socket.service';

interface LeaveButtonProps {
  meetingId: string;
  onLeave?: () => void;
}

export function LeaveButton({ meetingId: _meetingId, onLeave }: LeaveButtonProps) {
  const router = useRouter();

  const leave = () => {
    onLeave?.();
    disconnectSocket();
    router.push('/dashboard');
  };

  return (
    <Button variant="destructive" size="icon" onClick={leave} title="Leave">
      <PhoneOff className="h-5 w-5" />
    </Button>
  );
}
