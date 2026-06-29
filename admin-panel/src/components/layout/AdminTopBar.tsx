'use client';

import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export function AdminTopBar() {
  const router = useRouter();
  const { user, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header style={{
      display: 'flex',
      height: '56px',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(9,9,15,0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '0 24px',
    }}>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
        Admin Dashboard
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          fontSize: '13px', color: '#94a3b8',
          padding: '4px 12px', borderRadius: '99px',
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.15)',
        }}>
          {user?.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            fontSize: '13px',
            color: '#64748b',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f43f5e'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

