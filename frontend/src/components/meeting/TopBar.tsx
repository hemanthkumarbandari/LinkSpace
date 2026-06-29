'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { useParticipantStore } from '@/store/participantStore';
import { formatDuration } from '@/lib/utils';
import { APP_NAME } from '@/config/constants';
import { InviteOthers } from './InviteOthers';
import { RecordButton } from '@/components/controls/RecordButton';
import { useRecordingStore } from '@/store/recordingStore';
import { useUiStore } from '@/store/uiStore';

interface TopBarProps {
  meetingId: string;
}

export function TopBar({ meetingId }: TopBarProps) {
  const meeting = useMeetingStore((s) => s.meeting);
  const peers = useParticipantStore((s) => s.peers);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const participantCount = useMemo(() => {
    const remote = Array.from(peers.values()).filter(
      (p) => !p.waiting && p.peerId !== localPeer?.peerId
    );
    return remote.length + (localPeer ? 1 : 0);
  }, [peers, localPeer]);
  const [seconds, setSeconds] = useState(0);
  const isRecording = useRecordingStore((s) => s.isRecording);
  const isUploading = useRecordingStore((s) => s.isUploading);
  const toggleParticipants = useUiStore((s) => s.toggleParticipants);
  const isHost = localPeer?.role === 'host';

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      display: 'flex',
      height: '56px',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(9,9,15,0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '0 16px',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <span style={{
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1rem',
          flexShrink: 0,
        }}>
          {APP_NAME}
        </span>
        {meeting?.title && (
          <span style={{ color: '#94a3b8', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meeting.title}
          </span>
        )}
        {(isRecording || isUploading) && (
          <span
            style={{
              borderRadius: '99px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 700,
              background: isRecording ? 'rgba(244,63,94,0.15)' : 'rgba(168,85,247,0.15)',
              color: isRecording ? '#f43f5e' : '#a855f7',
              border: `1px solid ${isRecording ? 'rgba(244,63,94,0.3)' : 'rgba(168,85,247,0.3)'}`,
              flexShrink: 0,
            }}
            title={isRecording ? 'Recording in progress' : 'Uploading recording'}
          >
            {isRecording ? '● REC' : 'Uploading…'}
          </span>
        )}
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569', flexShrink: 0 }}>
          {meetingId}
        </span>
      </div>

      <span style={{
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#64748b',
        fontWeight: 600,
        flexShrink: 0,
      }}>
        {formatDuration(seconds)}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {isHost && <RecordButton meetingId={meetingId} />}
        <InviteOthers meetingId={meetingId} />
        <button
          type="button"
          onClick={toggleParticipants}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '13px',
            color: '#94a3b8',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="View participants"
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#a855f7';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.3)';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <Users style={{ width: '14px', height: '14px' }} />
          {participantCount}
        </button>
        {/* Removed top "End" button to avoid duplicate end/leave controls */}
      </div>
    </header>
  );
}

