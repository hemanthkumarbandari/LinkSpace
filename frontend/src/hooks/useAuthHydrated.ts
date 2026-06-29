'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !!useAuthStore.persist?.hasHydrated?.();
  });

  useEffect(() => {
    if (!useAuthStore.persist?.onFinishHydration) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(!!useAuthStore.persist?.hasHydrated?.());
    return unsub;
  }, []);

  return hydrated;
}
