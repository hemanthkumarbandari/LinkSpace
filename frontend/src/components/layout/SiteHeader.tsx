'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/config/constants';
import { useAuthStore } from '@/store/authStore';
import { Wifi, LayoutDashboard, LogOut } from 'lucide-react';

export function SiteHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '62px',
      background: 'rgba(8,8,8,0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* ── Logo ─────────────────────────────────────── */}
      <Link href="/" id="linkspace-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Geometric icon — no emoji */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: '#FF6B35',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(255,107,53,0.4)',
          flexShrink: 0,
        }}>
          <Wifi size={15} color="#080808" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          color: '#F5F5F5',
          letterSpacing: '-0.03em',
        }}>
          {APP_NAME}
        </span>
      </Link>

      {/* ── Nav ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
        {isAuthenticated && user ? (
          <>
            <span style={{
              padding: '4px 12px', borderRadius: '99px',
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.18)',
              color: '#FF9B72', fontSize: '13px', fontWeight: 500,
            }}>
              {user.name}
            </span>
            <Link
              href="/dashboard"
              id="header-dashboard-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A3A3A3', textDecoration: 'none',
                fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'rgba(67,97,238,0.1)';
                el.style.borderColor = 'rgba(67,97,238,0.3)';
                el.style.color = '#7B9FFF';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.color = '#A3A3A3';
              }}
            >
              <LayoutDashboard size={13} strokeWidth={2} />
              Dashboard
            </Link>
            <button
              id="header-signout-btn"
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#525252', cursor: 'pointer',
                fontWeight: 500, fontSize: '14px', transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = '#EF4444';
                el.style.borderColor = 'rgba(239,68,68,0.25)';
                el.style.background = 'rgba(239,68,68,0.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = '#525252';
                el.style.borderColor = 'rgba(255,255,255,0.07)';
                el.style.background = 'transparent';
              }}
            >
              <LogOut size={13} strokeWidth={2} />
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              id="header-signin-link"
              style={{
                color: '#525252', textDecoration: 'none',
                fontWeight: 500, transition: 'color 0.2s',
                padding: '7px 14px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F5F5F5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#525252'; }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              id="header-register-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '8px',
                background: '#FF6B35', color: '#080808',
                textDecoration: 'none', fontWeight: 700, fontSize: '13.5px',
                boxShadow: '0 0 16px rgba(255,107,53,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = '0 0 26px rgba(255,107,53,0.5)';
                el.style.transform = 'translateY(-1px)';
                el.style.background = '#FF7F4F';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.boxShadow = '0 0 16px rgba(255,107,53,0.3)';
                el.style.transform = 'translateY(0)';
                el.style.background = '#FF6B35';
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
