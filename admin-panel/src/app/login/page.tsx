'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminStore } from '@/store/adminStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome, admin');
      router.push('/dashboard');
    } catch {
      toast.error('Admin login failed — use an account with admin role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-100/50"
      >
        <h1 className="text-2xl font-bold text-slate-900">Meetings Admin</h1>
        <p className="text-sm text-slate-500">Sign in with your admin account.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-500 py-2 text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
