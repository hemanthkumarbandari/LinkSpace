'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { meetingService } from '@/services/meeting.service';
import Link from 'next/link';
import { APP_NAME } from '@/config/constants';

export default function CreateMeetingPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const ensureFreshSession = useAuthStore((s) => s.ensureFreshSession);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      const ok = await ensureFreshSession();
      if (!ok) router.replace('/login');
      setAuthChecked(true);
    })();
  }, [hydrated, ensureFreshSession, router]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await meetingService.create({ title: title || undefined });
      if (data.success) {
        const id = data.data.meetingId;
        await navigator.clipboard.writeText(id);
        toast.success(`Meeting created! ID ${id} copied — share to invite others`);
        router.push(`/lobby/${id}`);
      }
    } catch {
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || !authChecked) {
    return (
      <div style={{
        display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
        background: '#09090f', color: '#64748b', fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }} />
          Loading...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090f',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', boxShadow: '0 0 12px rgba(168,85,247,0.4)',
        }}>🔗</div>
        <span style={{
          fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
          background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{APP_NAME}</span>
      </Link>

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(18,17,31,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.08)',
      }}>
        <h1 style={{
          fontSize: '1.7rem', fontWeight: 700, color: '#f0eeff',
          fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px',
        }}>
          New Meeting
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
          After creating, share the meeting ID so others can join.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="title" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '8px' }}>
            Meeting title <span style={{ color: '#475569' }}>(optional)</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team standup, Design review…"
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0eeff', fontSize: '14px', outline: 'none',
              fontFamily: "'Inter', sans-serif",
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(168,85,247,0.5)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>

        <button
          id="create-meeting-btn"
          onClick={handleCreate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '10px',
            background: loading ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 20px rgba(168,85,247,0.4)',
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(168,85,247,0.6)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(168,85,247,0.4)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Creating…' : '🚀 Start Now'}
        </button>
      </div>
    </div>
  );
}

