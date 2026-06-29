import Link from 'next/link';
import { APP_NAME } from '@/config/constants';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090f',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(124,58,237,0.15) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', textAlign: 'center',
      fontFamily: "'Inter', sans-serif", color: '#f0eeff',
    }}>
      <p style={{
        fontSize: '5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
        background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        marginBottom: '8px',
      }}>404</p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f0eeff', marginBottom: '12px' }}>
        Page not found
      </h1>
      <p style={{ color: '#64748b', marginBottom: '36px', maxWidth: '380px' }}>
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '10px 24px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff', textDecoration: 'none', fontWeight: 600,
          boxShadow: '0 0 18px rgba(168,85,247,0.35)',
        }}>
          Go to {APP_NAME}
        </Link>
        <Link href="/dashboard" style={{
          padding: '10px 24px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0eeff', textDecoration: 'none', fontWeight: 500,
        }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
