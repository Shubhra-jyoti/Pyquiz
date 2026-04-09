'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, Award, BookOpen } from 'lucide-react';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetch('/api/progress').then(r => r.json()).then(setData);
  }, [user]);

  if (loading || !user || !data) return <div className="max-w-5xl mx-auto px-4 py-8"><div className="h-96 bg-gray-200 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><BarChart3 className="text-blue-600" /> Your Progress</h1>
      <p className="text-gray-500 mb-8">Detailed performance analytics across all chapters</p>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 text-center">
          <Target size={24} className="text-blue-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{data.overallAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Overall Accuracy</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 text-center">
          <BookOpen size={24} className="text-green-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{data.totalAttempted}</p>
          <p className="text-xs text-gray-400 mt-1">Questions Attempted</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 text-center">
          <TrendingUp size={24} className="text-indigo-600 mx-auto mb-2" />
          <p className="text-3xl font-bold">{data.totalCorrect}</p>
          <p className="text-xs text-gray-400 mt-1">Correct Answers</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-5 text-center">
          <Award size={24} className="text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{data.totalQuizzes}</p>
          <p className="text-xs text-gray-400 mt-1">Quizzes Completed</p>
        </div>
      </div>

      {/* Term Readiness */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Term Exam Readiness</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(t => {
            const r = data.termReadiness[t] || 0;
            return (
              <div key={t} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke={r >= 70 ? '#22c55e' : r >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8" fill="none" strokeDasharray={`${r * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{r.toFixed(0)}%</span>
                </div>
                <p className="font-medium text-sm">Term {t}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chapter Details */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Chapter-wise Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Chapter</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Term</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Attempted</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Correct</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Accuracy</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {data.progress.map((p: any) => (
                <tr key={p.chapterId} className="border-b border-gray-50 hover:bg-blue-50/30">
                  <td className="py-3 px-2 font-medium">{p.chapterTitle}</td>
                  <td className="text-center py-3 px-2"><span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">T{p.termExam}</span></td>
                  <td className="text-center py-3 px-2">{p.totalAttempted}</td>
                  <td className="text-center py-3 px-2">{p.totalCorrect}</td>
                  <td className="text-center py-3 px-2 font-medium">{p.mcqAccuracy.toFixed(1)}%</td>
                  <td className="text-center py-3 px-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.mastery}%` }} />
                      </div>
                      <span className="text-xs font-medium">{p.mastery.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.notStarted.map((ch: any) => (
                <tr key={ch.id} className="border-b border-gray-50 text-gray-400">
                  <td className="py-3 px-2">{ch.title}</td>
                  <td className="text-center py-3 px-2"><span className="bg-gray-50 text-gray-400 text-xs px-2 py-0.5 rounded-full">T{ch.termExam}</span></td>
                  <td className="text-center py-3 px-2">-</td>
                  <td className="text-center py-3 px-2">-</td>
                  <td className="text-center py-3 px-2">-</td>
                  <td className="text-center py-3 px-2 text-xs">Not Started</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
