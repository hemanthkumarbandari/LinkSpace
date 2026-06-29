'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MeetingsChartProps {
  data: { _id: string; count: number }[];
}

export function MeetingsChart({ data }: MeetingsChartProps) {
  const chartData = data.map((d) => ({ date: d._id, meetings: d.count }));
  return (
    <div className="h-64 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">Meetings per day (30d)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="meetings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
