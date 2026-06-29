import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/shared-types';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';

interface AdminState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await adminService.login(email, password);
        if (data.success && data.data.user.role === 'admin') {
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
          });
          setAuthToken(data.data.accessToken);
        } else {
          throw new Error('Admin access required');
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        setAuthToken(null);
      },

      fetchMe: async () => {
        const token = get().accessToken;
        if (!token) return;
        setAuthToken(token);
        const { data } = await adminService.me();
        if (data.success && data.data.role === 'admin') {
          set({ user: data.data });
        } else {
          get().logout();
        }
      },
    }),
    {
      name: 'connectnow-admin',
      partialize: (s) => ({
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
