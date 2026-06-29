'use client';

import { useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const ensureFreshSession = useAuthStore((s) => s.ensureFreshSession);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureFreshSession();
    }
  }, [isAuthenticated, ensureFreshSession]);

  useEffect(() => {
    if (!accessToken || user) return;
    authService
      .me()
      .then(({ data }) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});
  }, [accessToken, user, setUser]);

  return <>{children}</>;
}
