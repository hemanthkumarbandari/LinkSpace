'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { meetingService } from '@/services/meeting.service';
import Link from 'next/link';
import { APP_NAME } from '@/config/constants';

export default function JoinMeetingPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!meetingId.trim()) return;
    setLoading(true);
    try {
      const { data } = await meetingService.getById(meetingId.trim().toUpperCase());
      if (data.success) {
        router.push(`/lobby/${data.data.meetingId}`);
      }
    } catch {
      toast.error('Meeting not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090f',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Inter', sans-serif", color: '#f0eeff',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: '0 0 14px rgba(168,85,247,0.45)',
        }}>🔗</div>
        <span style={{
          fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
          background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{APP_NAME}</span>
      </Link>

      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(18,17,31,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 8px 60px rgba(0,0,0,0.5)',
      }}>
        <h1 style={{
          fontSize: '1.7rem', fontWeight: 700, color: '#f0eeff',
          fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px',
        }}>
          Join a Meeting
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
          Enter your meeting ID to join a space
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="code" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '8px' }}>
            Meeting ID
          </label>
          <input
            id="code"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
            placeholder="e.g. ABC12345"
            maxLength={8}
            style={{
              width: '100%', padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0eeff', fontSize: '15px', outline: 'none',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.5)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleJoin(); }}
          />
        </div>

        <button
          id="join-meeting-submit-btn"
          onClick={() => void handleJoin()}
          disabled={loading || !meetingId.trim()}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '10px',
            background: (loading || !meetingId.trim()) ? 'rgba(168,85,247,0.25)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: (loading || !meetingId.trim()) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || !meetingId.trim()) ? 'none' : '0 0 20px rgba(168,85,247,0.4)',
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {loading ? 'Checking…' : 'Continue →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#475569' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
