'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { adminService } from '@/services/admin.service';
import { setAuthToken } from '@/services/api';
import { useAdminStore } from '@/store/adminStore';

export default function UsersPage() {
  const accessToken = useAdminStore((s) => s.accessToken);
  const [users, setUsers] = useState<
    { _id: string; name: string; email: string; role: string }[]
  >([]);

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    adminService.getUsers().then(({ data }) => {
      if (data.success) setUsers(data.data.users);
    });
  }, [accessToken]);

  const changeRole = async (id: string, role: string) => {
    await adminService.changeRole(id, role);
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u))
    );
  };

  return (
    <div>
      <PageHeader title="Users" />
      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm">
        <table className="w-full text-sm text-slate-900">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-sky-100">
                <td className="px-4 py-3 text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-700">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => void changeRole(u._id, e.target.value)}
                    className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="user">user</option>
                    <option value="host">host</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
