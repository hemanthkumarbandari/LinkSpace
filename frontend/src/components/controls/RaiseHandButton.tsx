'use client';

import { Hand } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useParticipantStore } from '@/store/participantStore';
import { useMeetingStore } from '@/store/meetingStore';
import { cn } from '@/lib/utils';

interface RaiseHandButtonProps {
  onRaise: () => void;
  onLower: () => void;
}

export function RaiseHandButton({ onRaise, onLower }: RaiseHandButtonProps) {
  const localPeer = useParticipantStore((s) => s.localPeer);
  const localPeerId = useMeetingStore((s) => s.localPeerId);
  const updatePeer = useParticipantStore((s) => s.updatePeer);
  const setLocalPeer = useParticipantStore((s) => s.setLocalPeer);

  const raised = localPeer?.handRaised ?? false;

  const toggle = () => {
    if (!localPeerId || !localPeer) return;

    if (raised) {
      onLower();
      setLocalPeer({ ...localPeer, handRaised: false });
      updatePeer(localPeerId, { handRaised: false });
      toast.message('Hand lowered');
    } else {
      onRaise();
      setLocalPeer({ ...localPeer, handRaised: true });
      updatePeer(localPeerId, { handRaised: true });
      toast.success('Hand raised');
    }
  };

  return (
    <Button
      variant={raised ? 'default' : 'secondary'}
      size="icon"
      onClick={toggle}
      title={raised ? 'Lower hand' : 'Raise hand'}
      className={cn(
        raised && 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 hover:bg-amber-500'
      )}
    >
      <Hand className={cn('h-5 w-5', raised && 'animate-pulse')} />
    </Button>
  );
}
