import { StatCard } from '@/components/common/StatCard';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    totalMeetings: number;
    activeMeetings: number;
    totalDurationMinutes: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Total Meetings" value={stats.totalMeetings} />
      <StatCard title="Active Now" value={stats.activeMeetings} />
      <StatCard
        title="Total Duration"
        value={`${stats.totalDurationMinutes} min`}
      />
    </div>
  );
}
