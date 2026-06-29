'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoTile } from './VideoTile';
import { ScreenShareVideo } from './ScreenShareVideo';
import { useParticipantStore } from '@/store/participantStore';
import { useMediaStore } from '@/store/mediaStore';
import { useMeetingStore } from '@/store/meetingStore';
import { useUiStore } from '@/store/uiStore';
import { useVideoGrid, VIDEO_GRID_PAGE_SIZE } from '@/hooks/useVideoGrid';
import { Button } from '@/components/ui/button';
import type { RemotePeer } from '@/types/participant.types';

const SCREEN_SHARE_TILE_LIMIT = 4;

export function VideoGrid() {
  const peers = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const localStream = useMediaStore((s) => s.localStream);
  const localPeerId = useMeetingStore((s) => s.localPeerId);
  const pinnedPeerId = useUiStore((s) => s.pinnedPeerId);
  const pinPeer = useUiStore((s) => s.pinPeer);
  const localScreenStream = useMediaStore((s) => s.screenStream);
  const [page, setPage] = useState(0);

  const allPeers = useMemo(() => {
    const byUser = new Map<string, RemotePeer | (typeof localPeer & { stream?: MediaStream })>();

    if (localPeer && localPeerId) {
      byUser.set(localPeer.userId || localPeerId, {
        ...localPeer,
        peerId: localPeerId,
        stream: localStream ?? undefined,
      });
    }

    for (const peer of peers.values()) {
      if (peer.peerId === localPeerId) continue;
      const key = peer.userId || peer.peerId;
      byUser.set(key, peer);
    }

    return Array.from(byUser.values());
  }, [peers, localPeer, localPeerId, localStream]);

  const activeScreenShare = useMemo(() => {
    const hasLiveVideo = (s: MediaStream | undefined | null) =>
      !!s?.getVideoTracks().some((t) => t.readyState === 'live');

    if (hasLiveVideo(localScreenStream)) {
      return {
        stream: localScreenStream!,
        label: `${localPeer?.displayName ?? 'You'} (Screen)`,
      };
    }
    for (const peer of peers.values()) {
      if (hasLiveVideo(peer.screenStream)) {
        return {
          stream: peer.screenStream!,
          label: `${peer.displayName} (Screen)`,
        };
      }
    }
    return null;
  }, [localScreenStream, localPeer, peers]);

  const { templateColumns, templateRows, slots, totalPages } = useVideoGrid(allPeers.length, page);
  const pagePeers = allPeers.slice(page * VIDEO_GRID_PAGE_SIZE, page * VIDEO_GRID_PAGE_SIZE + VIDEO_GRID_PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  if (activeScreenShare) {
    const tilePeers = allPeers.slice(0, SCREEN_SHARE_TILE_LIMIT);
    const tileCols = tilePeers.length <= 1 ? 1 : 2;

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-slate-900 p-2">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="h-full w-full max-w-6xl">
            <ScreenShareVideo stream={activeScreenShare.stream} label={activeScreenShare.label} />
          </div>
        </div>
        {tilePeers.length > 0 && (
          <div className="flex shrink-0 justify-center px-2 pb-2 pt-2">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${tileCols}, minmax(140px, 220px))`,
              }}
            >
              {tilePeers.map((p) => (
                <VideoTile
                  key={p.peerId}
                  peer={p}
                  isLocal={p.peerId === localPeerId}
                  isPinned={pinnedPeerId === p.peerId}
                  onPin={() => pinPeer(pinnedPeerId === p.peerId ? null : p.peerId)}
                  className="aspect-video w-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-slate-900">
      <div
        className="grid min-h-0 flex-1 gap-2 p-3"
        style={{
          gridTemplateColumns: templateColumns,
          gridTemplateRows: templateRows,
        }}
      >
        {pagePeers.map((p, index) => {
          const slot = slots[index];
          if (!slot) return null;

          return (
            <div
              key={p.peerId}
              className="flex min-h-0 min-w-0 items-center justify-center"
              style={{
                gridColumn: slot.gridColumn,
                gridRow: slot.gridRow,
              }}
            >
              <VideoTile
                peer={p}
                isLocal={p.peerId === localPeerId}
                isPinned={pinnedPeerId === p.peerId}
                onPin={() => pinPeer(pinnedPeerId === p.peerId ? null : p.peerId)}
                className="h-full"
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-slate-700 px-4 py-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-300">
            Page {page + 1} of {totalPages} ({allPeers.length} participants)
          </span>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
