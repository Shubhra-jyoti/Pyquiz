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
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-40 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
          Welcome back, {user.displayName || user.username}!
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Ready to smash your Python goals today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
        <QuickAction href="/quiz/setup" icon={<BookOpen size={24} />} label="Start Quiz" gradient="from-blue-500 to-blue-600" shadow="shadow-blue-500/30" />
        <QuickAction href="/practice/coding" icon={<Code2 size={24} />} label="Code Practice" gradient="from-indigo-500 to-purple-600" shadow="shadow-indigo-500/30" />
        <QuickAction href="/progress" icon={<BarChart3 size={24} />} label="Full Progress" gradient="from-emerald-500 to-green-600" shadow="shadow-emerald-500/30" />
        <QuickAction href="/bookmarks" icon={<Bookmark size={24} />} label="Bookmarks" gradient="from-amber-400 to-orange-500" shadow="shadow-amber-500/30" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
        <StatCard icon={<Target size={22} />} label="Overall Accuracy" value={`${(data?.overallAccuracy || 0).toFixed(1)}%`} color="blue" />
        <StatCard icon={<BookOpen size={22} />} label="Questions Done" value={String(data?.totalAttempted || 0)} color="emerald" />
        <StatCard icon={<Trophy size={22} />} label="Quizzes Taken" value={String(data?.totalQuizzes || 0)} color="amber" />
        <StatCard icon={<TrendingUp size={22} />} label="Correct Answers" value={String(data?.totalCorrect || 0)} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chapter Progress */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/40 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800">Chapter Progress</h2>
              <Link href="/progress" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
                View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {chapters.map((ch) => {
                const prog = data?.progress?.find((p: any) => p.chapterId === ch.id);
                const mastery = prog?.mastery || 0;
                return (
                  <div key={ch.id} className="relative group">
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-inner">
                        {ch.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{ch.title}</p>
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded-md">Term {ch.termExam}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${mastery}%` }}>
                             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <span className="text-base font-bold text-gray-700 w-14 text-right">{mastery.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Term Readiness */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/40 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Exam Readiness</h2>
            <div className="space-y-5">
              {[1, 2, 3, 4].map((t) => {
                const readiness = data?.termReadiness?.[t] || 0;
                const colors = readiness >= 70 ? 'from-emerald-400 to-emerald-500' : readiness >= 40 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-red-500';
                return (
                  <div key={t} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-700">Term {t}</span>
                      <span className="font-bold text-gray-900">{readiness.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full bg-gradient-to-r ${colors} rounded-full transition-all duration-1000`} style={{ width: `${readiness}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-gray-200/40 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            {data?.recentAttempts && data.recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {data.recentAttempts.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-4 text-sm group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${a.score >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {a.score >= 70 ? <Trophy size={18} /> : <RotateCcw size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{a.mode} Quiz</p>
                      <p className="text-gray-500 font-medium text-xs mt-0.5">{a.correctCount}/{a.totalQuestions} correct</p>
                    </div>
                    <span className="font-black text-base text-gray-900">{a.score.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-500">No activity yet.<br/>Start your first quiz!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, gradient, shadow }: { href: string; icon: React.ReactNode; label: string; gradient: string; shadow: string }) {
  return (
    <Link href={href} className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 shadow-lg ${shadow} group`}>
      <div className="absolute top-0 left-0 w-full h-full bg-white/0 group-hover:bg-white/10 transition-colors" />
      <div className="transform transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
        {icon}
      </div>
      <span className="text-sm md:text-base font-bold tracking-wide">{label}</span>
      <ChevronRight size={16} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const styles: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border-blue-100',
    emerald: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border-amber-100',
    purple: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-600 border-purple-100',
  };
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg shadow-gray-200/30 p-6 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${styles[color]} flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-10 bg-gray-200 rounded-xl w-72 mb-10 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-3xl animate-pulse" />)}
      </div>
    </div>
  );
}
