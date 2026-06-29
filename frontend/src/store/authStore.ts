import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/shared-types';
import { authService } from '@/services/auth.service';
import { isAccessTokenStale } from '@/lib/jwtClient';
import { disconnectSocket } from '@/services/socket.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  guestAccessToken: string | null;
  guestUserId: string | null;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  ensureFreshSession: () => Promise<boolean>;
  createGuestSession: (displayName: string, meetingId?: string) => Promise<void>;
  clearGuestSession: () => void;
  getMeetingAccessToken: () => string | null;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      guestAccessToken: null,
      guestUserId: null,
      isGuest: false,

      login: async (email, password) => {
        const { data } = await authService.login({ email, password });
        if (data.success) {
          disconnectSocket();
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
            guestAccessToken: null,
            guestUserId: null,
            isGuest: false,
          });
        }
      },

      register: async (name, email, password) => {
        const { data } = await authService.register({ name, email, password });
        if (data.success) {
          disconnectSocket();
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
            guestAccessToken: null,
            guestUserId: null,
            isGuest: false,
          });
        }
      },

      logout: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) authService.logout().catch(() => {});
        disconnectSocket();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          guestAccessToken: null,
          guestUserId: null,
          isGuest: false,
        });
      },

      refreshSession: async () => {
        const rt = get().refreshToken;
        if (!rt) return false;
        try {
          const { data } = await authService.refresh(rt);
          if (data.success) {
            disconnectSocket();
            set({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            return true;
          }
        } catch {
          get().logout();
        }
        return false;
      },

      ensureFreshSession: async () => {
        const { accessToken, refreshToken, isAuthenticated, refreshSession } = get();
        if (!isAuthenticated || !refreshToken) return false;
        if (!isAccessTokenStale(accessToken)) return true;
        return refreshSession();
      },

      createGuestSession: async (displayName, meetingId) => {
        const { data } = await authService.createGuest({ displayName, meetingId });
        if (data.success) {
          disconnectSocket();
          set({
            guestAccessToken: data.data.accessToken,
            guestUserId: data.data.guestUserId,
            isGuest: true,
          });
        }
      },

      clearGuestSession: () => {
        disconnectSocket();
        set({
          guestAccessToken: null,
          guestUserId: null,
          isGuest: false,
        });
      },

      getMeetingAccessToken: () => {
        const s = get();
        if (s.isAuthenticated && s.accessToken) return s.accessToken;
        if (s.isGuest && s.guestAccessToken) return s.guestAccessToken;
        return null;
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'meetings-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
