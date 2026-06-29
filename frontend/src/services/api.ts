import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl } from '@/config/urls';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiUrl();
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ success: boolean; error?: { message: string } }>) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !(original as { _retry?: boolean })._retry) {
      (original as { _retry?: boolean })._retry = true;
      const isAuthRoute = original.url?.includes('/auth/login') ||
        original.url?.includes('/auth/register');
      if (isAuthRoute) return Promise.reject(error);

      const refreshed = await useAuthStore.getState().refreshSession();
      if (refreshed && original.headers) {
        original.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(original);
      }
      if (useAuthStore.getState().refreshToken) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
