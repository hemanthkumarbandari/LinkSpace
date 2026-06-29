'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';
import { useAdminStore } from '@/store/adminStore';

export default function AnalyticsPage() {
  const accessToken = useAdminStore((s) => s.accessToken);
  const [analytics, setAnalytics] = useState<{
    peakHours: { _id: number; count: number }[];
    averageDurationMinutes: number;
    topHosts: { _id: string; count: number; host?: { name: string }[] }[];
  } | null>(null);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    adminService.getAnalytics().then(({ data }) => {
      if (data.success) setAnalytics(data.data);
    });
  }, [accessToken]);

  if (!analytics) return <p className="text-slate-600">Loading analytics...</p>;

  const peakData = analytics.peakHours.map((h) => ({
    hour: `${h._id}:00`,
    meetings: h.count,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" />
      <p className="text-slate-700">
        Average meeting duration:{' '}
        <span className="font-semibold text-slate-900">
          {Math.round(analytics.averageDurationMinutes)} minutes
        </span>
      </p>
      <div className="h-64 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Peak hours</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={peakData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }} />
            <Line type="monotone" dataKey="meetings" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-4 font-semibold text-slate-900">Top hosts</h3>
        <ul className="space-y-2">
          {analytics.topHosts.map((h, i) => (
            <li key={i} className="text-slate-700">
              {h.host?.[0]?.name ?? h._id}: {h.count} meetings
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
