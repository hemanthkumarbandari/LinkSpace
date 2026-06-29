'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TopBar } from './TopBar';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from '@/components/controls/ControlBar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ParticipantsPanel } from '@/components/participants/ParticipantsPanel';
import { WaitingRoom } from './WaitingRoom';
import { ReactionOverlay } from '@/components/reactions/ReactionOverlay';
import { useMediasoup } from '@/hooks/useMediasoup';
import { useMeetingStore } from '@/store/meetingStore';
import { meetingService } from '@/services/meeting.service';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { Button } from '@/components/ui/button';
import { getSocketUrl } from '@/config/urls';

interface MeetingRoomProps {
  meetingId: string;
}

export function MeetingRoom({ meetingId }: MeetingRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayName = searchParams.get('name') ?? 'Guest';
  const { joinRoom, leaveRoom } = useMediasoup(meetingId);
  const status = useMeetingStore((s) => s.status);
  const setStatus = useMeetingStore((s) => s.setStatus);
  const setMeeting = useMeetingStore((s) => s.setMeeting);
  const { isChatOpen, isParticipantsOpen } = useUiStore();
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ensureFreshSession = useAuthStore((s) => s.ensureFreshSession);
  const createGuestSession = useAuthStore((s) => s.createGuestSession);
  const clearGuestSession = useAuthStore((s) => s.clearGuestSession);
  const [authReady, setAuthReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [takeoverAllowed, setTakeoverAllowed] = useState(false);
  const [joinAttempt, setJoinAttempt] = useState(0);

  useEffect(() => {
    meetingService.getById(meetingId).then(({ data }) => {
      if (data.success) setMeeting(data.data);
    });
  }, [meetingId, setMeeting]);

  useEffect(() => {
    if (!hydrated) return;

    const enterKey = `meeting-enter:${meetingId}`;
    const enteredViaLobby = sessionStorage.getItem(enterKey);
    if (!enteredViaLobby) {
      router.replace(`/lobby/${meetingId}`);
      return;
    }
    sessionStorage.removeItem(enterKey);

    void (async () => {
      if (isAuthenticated) {
        const ok = await ensureFreshSession();
        if (!ok) {
          toast.error('Session expired. Please sign in again.');
          router.replace('/login');
          return;
        }
      } else {
        try {
          await createGuestSession(displayName.trim() || 'Guest', meetingId);
        } catch {
          toast.error('Could not join meeting');
          router.replace(`/lobby/${meetingId}`);
          return;
        }
      }
      setAuthReady(true);
    })();
  }, [hydrated, meetingId, displayName, isAuthenticated, ensureFreshSession, createGuestSession, router]);

  useEffect(() => {
    if (!authReady) return;

    setJoinError(null);
    setTakeoverAllowed(false);
    setStatus('connecting');

    void joinRoom(displayName).catch((err) => {
      const message =
        err instanceof Error ? err.message : 'Failed to join meeting';
      setJoinError(message);
      toast.error(message);
      setStatus('idle');
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ALREADY_JOINED') {
        setTakeoverAllowed(true);
      }
      if (isAuthenticated && /jwt expired|session expired|sign in/i.test(message)) {
        router.replace('/login');
      }
    });

    const onUnload = () => {
      leaveRoom();
      if (!isAuthenticated) clearGuestSession();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [authReady, meetingId, displayName, joinRoom, leaveRoom, router, setStatus, joinAttempt, isAuthenticated, clearGuestSession]);

  if (!hydrated || !authReady) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-900">
        <p className="text-lg font-medium text-white">Loading...</p>
      </div>
    );
  }

  if (status === 'waiting') {
    return <WaitingRoom />;
  }

  if (status === 'connecting') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-900">
        <p className="text-lg font-medium text-white">Joining meeting...</p>
        <p className="text-sm text-slate-400">Allow camera and microphone when prompted</p>
      </div>
    );
  }

  if (status !== 'connected') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-900 px-6">
        <p className="text-lg font-medium text-white">Could not join the meeting</p>
        <p className="max-w-lg text-center text-sm text-slate-400">
          {joinError ??
            'The meeting server did not respond. WebSocket/polling to the backend must work.'}
        </p>
        {joinError && /jwt expired|session expired|sign in/i.test(joinError) && (
          <p className="max-w-lg text-center text-sm text-amber-300">
            Sign in again on this device. Logging in on another device can end older sessions.
          </p>
        )}
        <p className="max-w-lg text-center text-xs text-slate-500">
          Server: {getSocketUrl()} — if this fails, confirm backend-meet.nuhvin.com is up and CORS allows your site.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
          <Button onClick={() => router.push('/login')}>Sign in</Button>
          {takeoverAllowed && (
            <Button
              onClick={() => {
                setJoinError(null);
                setTakeoverAllowed(false);
                setStatus('connecting');
                void joinRoom(displayName, { force: true }).catch((err) => {
                  const message = err instanceof Error ? err.message : 'Failed to join meeting';
                  setJoinError(message);
                  toast.error(message);
                  setStatus('idle');
                });
              }}
            >
              Join here (disconnect other device)
            </Button>
          )}
          <Button onClick={() => setJoinAttempt((n) => n + 1)}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <TopBar meetingId={meetingId} />
      <div className="relative flex flex-1 overflow-hidden">
        <VideoGrid />
        {isChatOpen && <ChatPanel meetingId={meetingId} />}
        {isParticipantsOpen && <ParticipantsPanel meetingId={meetingId} />}
        <ReactionOverlay />
      </div>
      <ControlBar meetingId={meetingId} onLeave={leaveRoom} />
    </div>
  );
}
