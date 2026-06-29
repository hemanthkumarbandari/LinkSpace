'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';
import { useAdminStore } from '@/store/adminStore';

export default function MeetingsPage() {
  const accessToken = useAdminStore((s) => s.accessToken);
  const [meetings, setMeetings] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    adminService.getMeetings().then(({ data }) => {
      if (data.success) setMeetings(data.data.meetings);
    });
  }, [accessToken]);

  return (
    <div>
      <PageHeader title="Meetings" />
      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm">
        <table className="w-full text-sm text-slate-900">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => (
              <tr key={String(m.meetingId)} className="border-t border-sky-100">
                <td className="px-4 py-3 font-mono text-slate-900">{String(m.meetingId)}</td>
                <td className="px-4 py-3 text-slate-700">{String(m.title)}</td>
                <td className="px-4 py-3 text-slate-700">{String(m.status)}</td>
                <td className="px-4 py-3 text-slate-700">{String(m.activeParticipants ?? 0)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/meetings/${m.meetingId}`}
                    className="text-sky-700 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
