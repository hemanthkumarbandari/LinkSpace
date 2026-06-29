'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { useAuthStore } from '@/store/authStore';
import {
  Zap, Film, MonitorUp, MessageSquare, GraduationCap, ShieldCheck,
  ArrowRight, Video, Users, Clock, Lock,
} from 'lucide-react';

/* ── Feature data with Lucide icons ─────────────────────────── */
const features = [
  {
    Icon: Zap,
    title: 'Instant Connections',
    desc: 'Join or create a meeting in seconds. No downloads, no friction — just seamless WebRTC-powered video.',
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.08)',
    border: 'rgba(255,107,53,0.18)',
  },
  {
    Icon: Film,
    title: 'HD Video & Audio',
    desc: 'Crystal-clear quality with VP8, VP9, and H264 adaptive codecs, auto-scaling to your connection.',
    color: '#4361EE',
    bg: 'rgba(67,97,238,0.08)',
    border: 'rgba(67,97,238,0.18)',
  },
  {
    Icon: MonitorUp,
    title: 'Screen Sharing',
    desc: 'Share your screen, present slides, or collaborate on code — all with one click.',
    color: '#FFD60A',
    bg: 'rgba(255,214,10,0.07)',
    border: 'rgba(255,214,10,0.15)',
  },
  {
    Icon: MessageSquare,
    title: 'Live Chat',
    desc: 'Integrated in-meeting chat keeps conversations organised and everyone in the loop.',
    color: '#FF6B35',
    bg: 'rgba(255,107,53,0.08)',
    border: 'rgba(255,107,53,0.18)',
  },
  {
    Icon: GraduationCap,
    title: 'LMS Ready',
    desc: 'Built for education. Attendance tracking, batch management, and cloud recordings.',
    color: '#4361EE',
    bg: 'rgba(67,97,238,0.08)',
    border: 'rgba(67,97,238,0.18)',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure by Design',
    desc: 'End-to-end encrypted signaling, JWT-auth, and private meeting IDs keep your calls safe.',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.07)',
    border: 'rgba(34,197,94,0.15)',
  },
];

const stats = [
  { Icon: Video, num: 'WebRTC', label: 'Powered' },
  { Icon: Users, num: 'HD', label: 'Video Quality' },
  { Icon: Clock, num: '<1s', label: 'Join Time' },
  { Icon: Lock, num: 'E2E', label: 'Encrypted' },
];

/* ── Inline styles ──────────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    background: '#080808',
    color: '#F5F5F5',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden' as const,
  },
  /* Layered mesh gradient — distinct from generic purple glow */
  mesh: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none' as const,
    overflow: 'hidden',
    /* Conic + radial combo nobody else does */
    background: `
      radial-gradient(ellipse 65% 50% at 10%  0%,  rgba(255,107,53,0.13) 0%, transparent 65%),
      radial-gradient(ellipse 55% 45% at 95% 10%,  rgba(67,97,238,0.12)  0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 50% 105%, rgba(255,214,10,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 0%  80%,  rgba(67,97,238,0.08)  0%, transparent 55%)
    `,
  },
  /* Fine noise overlay for texture depth */
  noise: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '128px 128px',
  },
  /* Horizontal rule–style divider */
  divLine: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)',
    margin: '0 auto',
  },
};

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div style={S.page}>
      {/* ── Ambient mesh ─────────────────────────────────── */}
      <div aria-hidden="true" style={S.mesh}>
        <div style={S.noise} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SiteHeader />

        {/* ══════════════════ HERO ══════════════════ */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 32px 80px' }}>

          {/* ── Badge ── */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px 5px 10px', borderRadius: '99px',
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.22)',
              fontSize: '12.5px', fontWeight: 600, color: '#FF9B72',
              letterSpacing: '0.04em',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'rgba(255,107,53,0.18)',
              }}>
                <Zap size={10} color="#FF6B35" strokeWidth={2.5} />
              </span>
              HD Recording & LMS Integration — Live Now
            </span>
          </div>

          {/* ── Headline ── */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{
              fontSize: 'clamp(3rem, 7.5vw, 5.8rem)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.04em',
              marginBottom: '12px',
              fontFamily: "'Syne', sans-serif",
            }}>
              {/* Each word a distinct weight / treatment */}
              <span style={{ color: '#F5F5F5' }}>Meetings that</span>
              <br />
              <span style={{
                background: 'linear-gradient(105deg, #FF6B35 0%, #FFD60A 55%, #FF6B35 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s linear infinite',
              }}>
                actually work.
              </span>
            </h1>

            {/* Thin decorative accent line under headline */}
            <div style={{
              width: '64px', height: '3px', borderRadius: '99px',
              background: 'linear-gradient(90deg, #FF6B35, #4361EE)',
              margin: '0 auto 28px',
            }} />

            <p style={{
              fontSize: '1.15rem',
              color: '#737373',
              maxWidth: '480px',
              margin: '0 auto 44px',
              lineHeight: 1.75,
            }}>
              LinkSpace brings teams together with crystal-clear HD video,
              real-time collaboration, and zero-friction setup.
            </p>

            {/* ── CTAs ── */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                id="get-started-btn"
                onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px', borderRadius: '10px',
                  background: '#FF6B35',
                  color: '#080808',
                  fontWeight: 700, fontSize: '0.95rem',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(255,107,53,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = '0 0 42px rgba(255,107,53,0.55), inset 0 1px 0 rgba(255,255,255,0.2)';
                  el.style.background = '#FF7F4F';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 0 28px rgba(255,107,53,0.35), inset 0 1px 0 rgba(255,255,255,0.2)';
                  el.style.background = '#FF6B35';
                }}
              >
                Get Started Free
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>

              <a
                id="join-meeting-btn"
                href="/join-meeting"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px', borderRadius: '10px',
                  background: 'transparent',
                  color: '#F5F5F5',
                  fontWeight: 600, fontSize: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'rgba(255,255,255,0.05)';
                  el.style.borderColor = 'rgba(67,97,238,0.45)';
                  el.style.color = '#7B9FFF';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'transparent';
                  el.style.borderColor = 'rgba(255,255,255,0.1)';
                  el.style.color = '#F5F5F5';
                }}
              >
                <Video size={15} strokeWidth={2} />
                Join a Meeting
              </a>
            </div>

            <p style={{ marginTop: '24px', fontSize: '12.5px', color: '#404040' }}>
              No credit card required &nbsp;·&nbsp; Free forever for small teams
            </p>
          </div>

          {/* ══════════════════ STATS ══════════════════ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '100px',
          }}>
            {stats.map(({ Icon, num, label }, i) => (
              <div key={label} style={{
                padding: '28px 20px',
                textAlign: 'center',
                background: '#0f0f0f',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              }}>
                <Icon size={18} color="#FF6B35" strokeWidth={1.75} />
                <p style={{
                  fontSize: '1.65rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
                  color: '#F5F5F5', lineHeight: 1,
                }}>{num}</p>
                <p style={{ fontSize: '12px', color: '#404040', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ══════════════════ FEATURES ══════════════════ */}
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
              fontFamily: "'Syne', sans-serif", marginBottom: '14px',
              color: '#F5F5F5',
            }}>
              Everything you need to{' '}
              <span style={{
                background: 'linear-gradient(105deg, #4361EE, #7B9FFF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>connect</span>
            </h2>
            <p style={{ color: '#737373', fontSize: '0.97rem', maxWidth: '380px', margin: '0 auto' }}>
              Powerful features, wrapped in a fast and intuitive interface.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '96px',
          }}>
            {features.map(({ Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                style={{
                  background: '#0f0f0f',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '28px',
                  transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = border;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${border}`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Icon container */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '11px',
                  background: bg,
                  border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <Icon size={20} color={color} strokeWidth={1.8} />
                </div>

                <h3 style={{
                  fontSize: '1rem', fontWeight: 700, color: '#F5F5F5',
                  marginBottom: '8px', fontFamily: "'Syne', sans-serif",
                  letterSpacing: '-0.01em',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#525252', lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* ══════════════════ FOOTER CTA ══════════════════ */}
          <div style={{
            textAlign: 'center',
            padding: '64px 40px',
            borderRadius: '20px',
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative corner flare */}
            <div aria-hidden="true" style={{
              position: 'absolute', bottom: '-30px', right: '-30px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div aria-hidden="true" style={{
              position: 'absolute', top: '-30px', left: '-30px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(67,97,238,0.10) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '99px', marginBottom: '20px',
              background: 'rgba(67,97,238,0.08)',
              border: '1px solid rgba(67,97,238,0.2)',
              fontSize: '12px', fontWeight: 600, color: '#7B9FFF',
              letterSpacing: '0.04em',
            }}>
              <Users size={11} strokeWidth={2.5} /> Thousands of teams connected daily
            </span>

            <h2 style={{
              fontSize: '2.1rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
              color: '#F5F5F5', marginBottom: '12px', letterSpacing: '-0.03em',
            }}>
              Ready to link up?
            </h2>
            <p style={{ color: '#525252', marginBottom: '36px', fontSize: '0.97rem' }}>
              Start free — no credit card, no friction.
            </p>

            <button
              id="signup-footer-btn"
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 36px', borderRadius: '10px',
                background: '#FF6B35', color: '#080808',
                fontWeight: 700, fontSize: '0.97rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 28px rgba(255,107,53,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 0 44px rgba(255,107,53,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 0 28px rgba(255,107,53,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </main>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer style={{
          textAlign: 'center',
          padding: '28px 32px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          color: '#2a2a2a',
          fontSize: '13px',
        }}>
          © {new Date().getFullYear()} LinkSpace · Built with WebRTC
        </footer>
      </div>
    </div>
  );
}
