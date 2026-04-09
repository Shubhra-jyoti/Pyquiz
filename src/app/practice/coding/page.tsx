'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Code2, ChevronRight, Tag, BookOpen } from 'lucide-react';

export default function CodingListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/chapters').then(r => r.json()).then(d => setChapters(d.chapters || []));
  }, []);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({ type: 'CODING', limit: '100' });
    if (selectedChapter) params.set('chapterId', selectedChapter);
    setLoadingQ(true);
    fetch(`/api/questions?${params}`).then(r => r.json()).then(d => {
      setQuestions(d.questions || []);
      setLoadingQ(false);
    });
  }, [user, selectedChapter]);

  if (loading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Code2 className="text-blue-600" /> Coding Practice</h1>
          <p className="text-gray-500 text-sm mt-1">{questions.length} coding questions available</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => setSelectedChapter('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!selectedChapter ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-200'}`}>
          All Chapters
        </button>
        {chapters.map(ch => (
          <button key={ch.id} onClick={() => setSelectedChapter(String(ch.id))}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedChapter === String(ch.id) ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-200'
            }`}>
            U{ch.number}
          </button>
        ))}
      </div>

      {/* Questions */}
      {loadingQ ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q.id} href={`/practice/coding/${q.id}`}
              className="block bg-white rounded-xl border border-[var(--border)] p-5 card-hover group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      Unit {q.chapter?.number}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {q.marks} marks
                    </span>
                    {q.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.difficulty === 'EASY' ? 'bg-green-50 text-green-600' :
                        q.difficulty === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      }`}>{q.difficulty}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2">{q.questionText}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-6 flex-shrink-0" />
              </div>
            </Link>
          ))}
          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Code2 size={48} className="mx-auto mb-3 opacity-30" />
              <p>No coding questions found for this filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
