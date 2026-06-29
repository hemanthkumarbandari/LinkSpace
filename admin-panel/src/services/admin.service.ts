import { api } from './api';

export const adminService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  me: () => api.get('/auth/me'),

  getStats: () => api.get('/admin/stats'),

  getMeetings: (page = 1, status?: string) =>
    api.get('/admin/meetings', { params: { page, limit: 20, status } }),

  getUsers: (page = 1) =>
    api.get('/admin/users', { params: { page, limit: 20 } }),

  changeRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  forceEndMeeting: (id: string) => api.delete(`/admin/meetings/${id}`),

  getMeetingReport: (id: string) => api.get(`/admin/meetings/${id}/report`),

  getAnalytics: () => api.get('/admin/analytics'),
};
