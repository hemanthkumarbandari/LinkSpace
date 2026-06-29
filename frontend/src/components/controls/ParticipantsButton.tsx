'use client';

import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';
import { useParticipantStore } from '@/store/participantStore';

export function ParticipantsButton() {
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  const peersMap = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const count =
    Array.from(peersMap.values()).filter((p) => !p.waiting).length + (localPeer ? 1 : 0);

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleParticipants}
      className="relative"
      title={`Participants (${count})`}
    >
      <Users className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Button>
  );
}
