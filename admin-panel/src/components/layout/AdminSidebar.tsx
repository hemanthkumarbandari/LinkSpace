'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/meetings', label: 'Meetings', icon: Video },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: '224px',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(12,11,20,0.9)',
      backdropFilter: 'blur(12px)',
      padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', marginBottom: '28px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', boxShadow: '0 0 10px rgba(168,85,247,0.4)',
          flexShrink: 0,
        }}>🔗</div>
        <div>
          <p style={{
            fontWeight: 700, fontSize: '1rem', fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1.1,
          }}>LinkSpace</p>
          <p style={{ fontSize: '10px', color: '#475569', fontWeight: 500, letterSpacing: '0.05em' }}>ADMIN</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '10px',
                padding: '9px 12px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                color: isActive ? '#f0eeff' : '#64748b',
                background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2))' : 'transparent',
                border: isActive ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon style={{ width: '16px', height: '16px', color: isActive ? '#a855f7' : '#475569' }} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

