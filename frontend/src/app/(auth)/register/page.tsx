import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { APP_NAME } from '@/config/constants';

export default function RegisterPage() {
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

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(18,17,31,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.1)',
      }}>
        <h1 style={{
          fontSize: '1.7rem', fontWeight: 700, color: '#f0eeff',
          fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px',
        }}>
          Create your account
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Join {APP_NAME} and start connecting today
        </p>

        <RegisterForm />

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

