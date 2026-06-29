'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { meetingService } from '@/services/meeting.service';
import type { Meeting } from '@/types/shared-types';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const ensureFreshSession = useAuthStore((s) => s.ensureFreshSession);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [rejoiningId, setRejoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    void (async () => {
      const ok = await ensureFreshSession();
      if (!ok) {
        router.replace('/login');
        return;
      }

      meetingService
        .getHistory()
        .then(({ data }) => {
          if (data.success) setMeetings(data.data);
        })
        .finally(() => setLoading(false));
    })();
  }, [hydrated, ensureFreshSession, router]);

  const handleJoin = async () => {
    const meetingId = joinMeetingId.trim().toUpperCase();
    if (!meetingId) {
      toast.error('Please enter a meeting ID');
      return;
    }

    setJoinLoading(true);
    try {
      const { data } = await meetingService.join(meetingId);
      if (data.success) {
        toast.success('Joining meeting...');
        setIsJoinOpen(false);
        setJoinMeetingId('');
        router.push(`/room/${meetingId}`);
      } else {
        toast.error('Meeting not found');
      }
    } catch {
      toast.error('Meeting not found');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRejoin = async (meeting: Meeting) => {
    if (meeting.status === 'ended' && meeting.hostId !== user?._id) {
      toast.error('Only the host can restart an ended meeting');
      return;
    }

    setRejoiningId(meeting.meetingId);
    try {
      const { data } = await meetingService.rejoin(meeting.meetingId);
      if (data.success) {
        toast.success(
          meeting.status === 'ended' ? 'Meeting restarted' : 'Rejoining meeting...'
        );
        router.push(`/room/${meeting.meetingId}`);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data
              ?.error?.message
          : undefined;
      toast.error(message ?? 'Could not rejoin meeting');
    } finally {
      setRejoiningId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0eeff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
  };

  const btnPrimary: React.CSSProperties = {
    padding: '9px 20px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 0 16px rgba(168,85,247,0.3)',
  };

  const btnOutline: React.CSSProperties = {
    padding: '9px 20px',
    borderRadius: '9px',
    background: 'transparent',
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  if (!hydrated) {
    return (
      <div style={{
        display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
        background: '#09090f', color: '#64748b', fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid rgba(168,85,247,0.3)',
            borderTopColor: '#a855f7',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          Loading...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090f', color: '#f0eeff', fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#f0eeff', marginBottom: '4px' }}>
              My Spaces
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Your recent meetings and spaces</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              href="/create-meeting"
              id="new-meeting-btn"
              style={{
                ...btnPrimary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 28px rgba(168,85,247,0.5)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 16px rgba(168,85,247,0.3)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              + New Meeting
            </Link>
            <button
              id="join-meeting-modal-btn"
              onClick={() => setIsJoinOpen(true)}
              style={btnOutline}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.4)';
                (e.currentTarget as HTMLButtonElement).style.color = '#c084fc';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
              }}
            >
              Join Meeting
            </button>
          </div>
        </div>

        {/* Meeting list */}
        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '48px 0' }}>Loading your meetings...</p>
        ) : meetings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 32px',
            background: 'rgba(18,17,31,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔗</div>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>No meetings yet — create one to get started</p>
            <Link href="/create-meeting" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
              Start your first meeting
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {meetings.map((m) => {
              const canRejoin = m.status !== 'ended' || m.hostId === user?._id;
              const isActive = m.status === 'active';
              return (
                <li
                  key={m.meetingId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(18,17,31,0.9)',
                    padding: '16px 20px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLLIElement).style.borderColor = 'rgba(168,85,247,0.25)';
                    (e.currentTarget as HTMLLIElement).style.background = 'rgba(26,23,48,0.95)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLLIElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLLIElement).style.background = 'rgba(18,17,31,0.9)';
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#f0eeff', fontSize: '15px', marginBottom: '4px' }}>{m.title}</p>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      <span style={{ fontFamily: 'monospace' }}>{m.meetingId}</span>
                      {' · '}
                      {format(new Date(m.createdAt), 'PPp')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                      borderRadius: '99px',
                      padding: '3px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#10b981' : '#64748b',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                      {m.status}
                    </span>
                    <button
                      style={{
                        ...btnOutline,
                        padding: '6px 14px',
                        fontSize: '13px',
                        opacity: (!canRejoin || rejoiningId === m.meetingId) ? 0.5 : 1,
                        cursor: (!canRejoin || rejoiningId === m.meetingId) ? 'not-allowed' : 'pointer',
                      }}
                      disabled={!canRejoin || rejoiningId === m.meetingId}
                      onClick={() => void handleRejoin(m)}
                      onMouseEnter={e => {
                        if (!canRejoin || rejoiningId === m.meetingId) return;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.4)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#c084fc';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                      }}
                    >
                      {rejoiningId === m.meetingId ? 'Joining…' : m.status === 'ended' ? 'Restart' : 'Rejoin'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Join Modal */}
      {isJoinOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            padding: '16px',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Join Meeting"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsJoinOpen(false);
          }}
        >
          <div style={{
            width: '100%', maxWidth: '420px',
            background: 'rgba(18,17,31,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#f0eeff', marginBottom: '20px' }}>
              Join a Meeting
            </h2>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="joinMeetingId" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '8px' }}>
                Meeting ID
              </label>
              <input
                id="joinMeetingId"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
                placeholder="Enter Meeting ID"
                autoFocus
                style={inputStyle}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.5)'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                style={btnOutline}
                onClick={() => {
                  setIsJoinOpen(false);
                  setJoinMeetingId('');
                }}
                disabled={joinLoading}
              >
                Cancel
              </button>
              <button
                style={{
                  ...btnPrimary,
                  opacity: joinLoading ? 0.7 : 1,
                  cursor: joinLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={() => void handleJoin()}
                disabled={joinLoading}
              >
                {joinLoading ? 'Joining…' : 'Join Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


