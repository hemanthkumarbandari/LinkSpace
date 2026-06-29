import { Mic, MicOff, Video, VideoOff, Hand, MonitorUp } from 'lucide-react';
import type { PeerInfo } from '@/types/shared-types';

interface ParticipantItemProps {
  peer: PeerInfo;
  isLocal?: boolean;
}

export function ParticipantItem({ peer, isLocal }: ParticipantItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-sky-100 bg-sky-50/40 px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-medium text-sky-800">
        {peer.displayName.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-900">
          {peer.displayName}
          {isLocal ? ' (You)' : ''}
        </p>
        {peer.role === 'host' && <p className="text-xs text-amber-600">Host</p>}
      </div>
      <div className="flex gap-1 text-slate-500">
        {peer.micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-500" />}
        {peer.cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        {peer.isScreenSharing && <MonitorUp className="h-4 w-4 text-sky-600" />}
        {peer.handRaised && <Hand className="h-4 w-4 text-yellow-500" />}
      </div>
    </div>
  );
}
