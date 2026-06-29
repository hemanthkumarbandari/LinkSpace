'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';
import { useAdminStore } from '@/store/adminStore';

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ meetingId: string } | null>(null);
  const accessToken = useAdminStore((s) => s.accessToken);
  const [report, setReport] = useState<{
    meeting: Record<string, unknown>;
    attendance: Record<string, unknown>[];
  } | null>(null);

  useEffect(() => {
    void params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    if (accessToken) setAuthToken(accessToken);
    adminService.getMeetingReport(resolvedParams.meetingId).then(({ data }) => {
      if (data.success) setReport(data.data);
    });
  }, [accessToken, resolvedParams]);

  const exportCsv = () => {
    if (!report?.attendance.length) return;
    const headers = ['userId', 'status', 'totalDuration', 'attendancePercentage'];
    const rows = report.attendance.map((a) =>
      headers.map((h) => String(a[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${resolvedParams?.meetingId ?? 'meeting'}.csv`;
    a.click();
  };

  if (!resolvedParams || !report) return <p className="text-slate-600">Loading...</p>;

  return (
    <div>
      <PageHeader
        title={String(report.meeting.title)}
        description={`Meeting ${resolvedParams.meetingId}`}
      />
      <button
        type="button"
        onClick={exportCsv}
        className="mb-4 rounded-lg bg-sky-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-sky-700"
      >
        Export attendance CSV
      </button>
      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm">
        <table className="w-full text-sm text-slate-900">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Duration (s)</th>
              <th className="px-4 py-3 text-left">%</th>
            </tr>
          </thead>
          <tbody>
            {report.attendance.map((a, i) => (
              <tr key={i} className="border-t border-sky-100">
                <td className="px-4 py-3 font-mono text-slate-900">
                  {String(a.userId)}
                </td>
                <td className="px-4 py-3 text-slate-700">{String(a.status)}</td>
                <td className="px-4 py-3 text-slate-700">
                  {String(a.totalDuration)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {String(a.attendancePercentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
