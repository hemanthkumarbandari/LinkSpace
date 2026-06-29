'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { useAdminStore } from '@/store/adminStore';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchMe, accessToken } = useAdminStore();

  useEffect(() => {
    if (!isAuthenticated && !accessToken) {
      router.replace('/login');
      return;
    }
    void fetchMe();
  }, [isAuthenticated, accessToken, fetchMe, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
