'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PreviewVideo } from './PreviewVideo';
import { DeviceSelector } from './DeviceSelector';
import { useDevices } from '@/hooks/useDevices';
import { useLocalStream } from '@/hooks/useLocalStream';
import { useMediaStore } from '@/store/mediaStore';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { meetingService } from '@/services/meeting.service';
import type { Meeting } from '@/types/shared-types';
import { APP_NAME } from '@/config/constants';

interface LobbyPageProps {
  meetingId: string;
}

export function LobbyPage({ meetingId }: LobbyPageProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const { availableDevices } = useDevices();
  const { localStream, startPreview } = useLocalStream();
  const {
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    selectedCamera,
    selectedMic,
    setSelectedCamera,
    setSelectedMic,
  } = useMediaStore();

  useEffect(() => {
    meetingService.getById(meetingId).then(({ data }) => {
      if (data.success) setMeeting(data.data);
    });
    void startPreview();
  }, [meetingId, startPreview]);

  useEffect(() => {
    if (selectedCamera || selectedMic) void startPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-preview when device changes
  }, [selectedCamera, selectedMic]);

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer', color: '#f0eeff', transition: 'all 0.2s',
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', flexDirection: 'column',
      background: '#09090f', color: '#f0eeff', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Preview column */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '32px', background: '#09090f',
        }}>
          <div style={{
            aspectRatio: '16/9', width: '100%', maxWidth: '720px',
            overflow: 'hidden', borderRadius: '16px',
            border: '1px solid rgba(168,85,247,0.2)',
            background: '#0f0e1a',
            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
          }}>
            <PreviewVideo stream={localStream} />
          </div>
        </div>

        {/* Settings panel */}
        <div style={{
          width: '360px', flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(12,11,20,0.95)',
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          {/* Meeting info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px',
              }}>🔗</div>
              <span style={{
                fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                fontSize: '0.9rem',
              }}>{APP_NAME}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meeting ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#f0eeff', fontWeight: 600, marginBottom: '4px' }}>{meetingId}</p>
            {meeting && (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{meeting.title}</p>
            )}
          </div>

          {/* Display name */}
          <div>
            <Label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
              Display name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#f0eeff',
              }}
            />
          </div>

          <DeviceSelector
            label="Camera"
            devices={availableDevices.cameras}
            value={selectedCamera}
            onChange={setSelectedCamera}
          />
          <DeviceSelector
            label="Microphone"
            devices={availableDevices.mics}
            value={selectedMic}
            onChange={setSelectedMic}
          />

          {/* Toggle buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              style={{
                ...iconBtnStyle,
                background: isMicOn ? 'rgba(168,85,247,0.15)' : 'rgba(244,63,94,0.12)',
                borderColor: isMicOn ? 'rgba(168,85,247,0.3)' : 'rgba(244,63,94,0.25)',
              }}
              onClick={toggleMic}
              title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicOn
                ? <Mic style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                : <MicOff style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
              }
            </button>
            <button
              type="button"
              style={{
                ...iconBtnStyle,
                background: isCameraOn ? 'rgba(168,85,247,0.15)' : 'rgba(244,63,94,0.12)',
                borderColor: isCameraOn ? 'rgba(168,85,247,0.3)' : 'rgba(244,63,94,0.25)',
              }}
              onClick={toggleCamera}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn
                ? <Video style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                : <VideoOff style={{ width: '18px', height: '18px', color: '#f43f5e' }} />
              }
            </button>
          </div>

          {/* Join button */}
          <button
            id="lobby-join-btn"
            style={{
              padding: '13px 24px',
              borderRadius: '11px',
              background: displayName.trim() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(168,85,247,0.2)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              cursor: displayName.trim() ? 'pointer' : 'not-allowed',
              boxShadow: displayName.trim() ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif",
            }}
            onClick={() => {
              if (!displayName.trim()) return;
              sessionStorage.setItem(`meeting-enter:${meetingId}`, '1');
              router.push(`/meeting/${meetingId}?name=${encodeURIComponent(displayName.trim())}`);
            }}
            disabled={!displayName.trim()}
          >
            Join Now →
          </button>

          {!isAuthenticated && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569' }}>
              Joining as guest.{' '}
              <Link href="/login" style={{ color: '#a855f7', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>{' '}
              to host or create meetings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
