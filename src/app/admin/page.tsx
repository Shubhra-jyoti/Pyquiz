'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, BookOpen, FileText, BarChart3, CheckCircle, AlertTriangle, Edit3 } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && user.role !== 'ADMIN') router.push('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).then(setStats).catch(() => {});
    }
  }, [user]);

  if (loading || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage questions, review content, and monitor platform usage</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AdminStatCard icon={<BookOpen size={20} />} label="Total Questions" value={stats?.totalQuestions || '503'} color="blue" />
        <AdminStatCard icon={<Users size={20} />} label="Total Users" value={stats?.totalUsers || '-'} color="green" />
        <AdminStatCard icon={<AlertTriangle size={20} />} label="Needs Review" value={stats?.needsReview || '-'} color="amber" />
        <AdminStatCard icon={<BarChart3 size={20} />} label="Quiz Attempts" value={stats?.totalAttempts || '-'} color="indigo" />
      </div>

      {/* Admin Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminActionCard href="/admin/questions" icon={<Edit3 size={22} />} title="Question Manager"
          desc="View, edit, publish/unpublish questions. Edit chapter mappings." color="blue" />
        <AdminActionCard href="/admin/review" icon={<AlertTriangle size={22} />} title="Review Queue"
          desc="Review AI verification conflicts and low-confidence parsed questions." color="amber" />
        <AdminActionCard href="/admin/users" icon={<Users size={22} />} title="User Management"
          desc="View registered users, manage roles." color="green" />
      </div>
    </div>
  );
}

function AdminStatCard({ icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600', indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-5 card-hover">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function AdminActionCard({ href, icon, title, desc, color }: any) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 hover:bg-blue-50', amber: 'border-amber-200 hover:bg-amber-50', green: 'border-green-200 hover:bg-green-50',
  };
  return (
    <Link href={href} className={`block bg-white rounded-xl border-2 ${colors[color]} p-6 transition-all card-hover`}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
