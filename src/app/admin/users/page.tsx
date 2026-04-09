'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') router.push('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/users').then(r => r.ok ? r.json() : { users: [] }).then(d => setUsers(d.users || [])).catch(() => {});
    }
  }, [user]);

  if (loading || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-blue-600" /> User Management</h1>

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Username</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-50 hover:bg-blue-50/30">
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  {u.role === 'ADMIN' ? <Shield size={14} className="text-blue-600" /> : <User size={14} className="text-gray-400" />}
                  {u.username}
                </td>
                <td className="py-3 px-4 text-gray-500">{u.email || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
