'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Code2, Trophy, Target, TrendingUp, Clock,
  ChevronRight, BarChart3, Bookmark, RotateCcw
} from 'lucide-react';

interface ProgressData {
  progress: any[];
  overallAccuracy: number;
  totalQuizzes: number;
  totalAttempted: number;
  totalCorrect: number;
  termReadiness: Record<number, number>;
  weakChapters: any[];
  notStarted: any[];
  recentAttempts: any[];
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch('/api/progress').then(r => r.json()),
        fetch('/api/chapters').then(r => r.json()),
      ]).then(([prog, ch]) => {
        setData(prog);
        setChapters(ch.chapters || []);
        setLoadingData(false);
      }).catch(() => setLoadingData(false));
    }
  }, [user]);

  if (loading || !user) return <LoadingSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user.displayName || user.username}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning progress overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickAction href="/quiz/setup" icon={<BookOpen size={22} />} label="Start Quiz" color="blue" />
        <QuickAction href="/practice/coding" icon={<Code2 size={22} />} label="Code Practice" color="indigo" />
        <QuickAction href="/progress" icon={<BarChart3 size={22} />} label="Progress" color="green" />
        <QuickAction href="/bookmarks" icon={<Bookmark size={22} />} label="Bookmarks" color="amber" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Target size={20} />} label="Overall Accuracy" value={`${(data?.overallAccuracy || 0).toFixed(1)}%`} color="blue" />
        <StatCard icon={<BookOpen size={20} />} label="Questions Done" value={String(data?.totalAttempted || 0)} color="green" />
        <StatCard icon={<Trophy size={20} />} label="Quizzes Taken" value={String(data?.totalQuizzes || 0)} color="amber" />
        <StatCard icon={<TrendingUp size={20} />} label="Correct Answers" value={String(data?.totalCorrect || 0)} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chapter Progress */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Chapter Progress</h2>
              <Link href="/progress" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {chapters.map((ch) => {
                const prog = data?.progress?.find((p: any) => p.chapterId === ch.id);
                const mastery = prog?.mastery || 0;
                return (
                  <div key={ch.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {ch.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{ch.title}</p>
                        <span className="text-xs text-gray-400 ml-2">T{ch.termExam}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full progress-fill" style={{ width: `${mastery}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{mastery.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Term Readiness */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold mb-4">Term Exam Readiness</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((t) => {
                const readiness = data?.termReadiness?.[t] || 0;
                const color = readiness >= 70 ? 'bg-green-500' : readiness >= 40 ? 'bg-yellow-500' : 'bg-red-400';
                return (
                  <div key={t}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Term {t}</span>
                      <span className="text-gray-500">{readiness.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full progress-fill`} style={{ width: `${readiness}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {data?.recentAttempts && data.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {data.recentAttempts.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.score >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {a.score >= 70 ? <Trophy size={14} /> : <RotateCcw size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{a.mode} Quiz</p>
                      <p className="text-gray-400 text-xs">{a.correctCount}/{a.totalQuestions} correct</p>
                    </div>
                    <span className="font-semibold text-sm">{a.score.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No activity yet. Start a quiz!</p>
            )}
          </div>

          {/* Weak Chapters */}
          {data?.weakChapters && data.weakChapters.length > 0 && (
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
              <h2 className="text-lg font-semibold text-orange-800 mb-3">🔥 Needs Attention</h2>
              <div className="space-y-2">
                {data.weakChapters.slice(0, 3).map((wc: any) => (
                  <Link key={wc.chapterId} href={`/quiz/setup?chapter=${wc.chapterId}`}
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-orange-100 transition-colors">
                    <span className="text-orange-900">{wc.title}</span>
                    <span className="text-orange-600 font-medium">{wc.mastery.toFixed(0)}%</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    amber: 'bg-amber-500 hover:bg-amber-600',
  };
  return (
    <Link href={href} className={`${colors[color]} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all card-hover`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4 card-hover">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );
}
