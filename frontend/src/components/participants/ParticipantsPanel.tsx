'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';
import { ParticipantItem } from './ParticipantItem';
import { useUiStore } from '@/store/uiStore';
import { useParticipantStore } from '@/store/participantStore';
import { getMeetingSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

interface ParticipantsPanelProps {
  meetingId: string;
}

export function ParticipantsPanel({ meetingId }: ParticipantsPanelProps) {
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  const peersMap = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const activePeers = useMemo(
    () => Array.from(peersMap.values()).filter((p) => !p.waiting),
    [peersMap]
  );
  const sortedParticipants = useMemo(() => {
    const all = [
      ...(localPeer ? [localPeer] : []),
      ...activePeers.filter((p) => p.peerId !== localPeer?.peerId),
    ];
    return all.sort((a, b) => {
      if (a.handRaised && !b.handRaised) return -1;
      if (!a.handRaised && b.handRaised) return 1;
      return 0;
    });
  }, [localPeer, activePeers]);
  const waitingPeers = useMemo(
    () => Array.from(peersMap.values()).filter((p) => p.waiting),
    [peersMap]
  );
  const accessToken = useAuthStore((s) => s.accessToken);
  const count = sortedParticipants.length;
  const isHost = localPeer?.role === 'host' || localPeer?.role === 'co-host';

  const admit = (peerId: string) => {
    if (!accessToken) return;
    getMeetingSocket(accessToken).emit('admit-from-waiting', {
      meetingId,
      targetPeerId: peerId,
    });
  };

  return (
    <aside className="flex w-80 flex-col border-l border-sky-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-sky-100 p-4">
        <h3 className="font-semibold text-slate-900">Participants ({count})</h3>
        <button type="button" onClick={toggleParticipants} className="text-slate-400 hover:text-sky-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {isHost && waitingPeers.length > 0 && (
          <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Waiting room ({waitingPeers.length})
            </p>
            <div className="space-y-2">
              {waitingPeers.map((p) => (
                <div key={p.peerId} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <ParticipantItem peer={p} />
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => admit(p.peerId)}>
                    Admit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {sortedParticipants.map((p) => (
          <ParticipantItem
            key={p.peerId}
            peer={p}
            isLocal={p.peerId === localPeer?.peerId}
          />
        ))}
        {count === 0 && (
          <p className="text-center text-sm text-slate-500">No participants yet</p>
        )}
      </div>
    </aside>
  );
}
