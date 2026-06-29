'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { MeetingsChart } from '@/components/dashboard/MeetingsChart';
import { PageHeader } from '@/components/common/PageHeader';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';
import { useAdminStore } from '@/store/adminStore';

export default function DashboardOverviewPage() {
  const accessToken = useAdminStore((s) => s.accessToken);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalMeetings: number;
    activeMeetings: number;
    totalDurationMinutes: number;
    meetingsPerDay: { _id: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    adminService.getStats().then(({ data }) => {
      if (data.success) setStats(data.data);
    });
  }, [accessToken]);

  if (!stats) {
    return <p className="text-slate-600">Loading stats...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Platform statistics at a glance" />
      <StatsCards stats={stats} />
      <MeetingsChart data={stats.meetingsPerDay} />
    </div>
  );
}
