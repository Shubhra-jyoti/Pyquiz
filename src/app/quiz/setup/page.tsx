'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BookOpen, Clock, Shuffle, Hash, Play, ChevronRight } from 'lucide-react';

function QuizSetupContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedChapter = searchParams.get('chapter');

  const [chapters, setChapters] = useState<any[]>([]);
  const [mode, setMode] = useState<string>('CHAPTER');
  const [chapterId, setChapterId] = useState<string>(preselectedChapter || '');
  const [termExam, setTermExam] = useState<string>('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(600);
  const [questionType, setQuestionType] = useState<string>('MCQ');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/chapters').then(r => r.json()).then(d => setChapters(d.chapters || []));
  }, []);

  const startQuiz = async () => {
    setError('');
    if (mode === 'CHAPTER' && !chapterId) { setError('Select a chapter'); return; }
    if (mode === 'TERM' && !termExam) { setError('Select a term exam'); return; }

    setStarting(true);
    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          chapterId: chapterId ? parseInt(chapterId) : undefined,
          termExam: termExam ? parseInt(termExam) : undefined,
          questionCount,
          timed,
          timeLimit: timed ? timeLimit : undefined,
          questionType: questionType || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('quizData', JSON.stringify(data));
        router.push(`/quiz/${data.attemptId}`);
      } else {
        setError(data.error || 'Failed to start quiz');
      }
    } catch {
      setError('Network error');
    }
    setStarting(false);
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Start a Practice Quiz</h1>
      <p className="text-gray-500 mb-8">Configure your quiz and start practicing</p>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 md:p-8 space-y-6">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Quiz Mode</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'CHAPTER', label: 'Chapter', icon: <BookOpen size={18} /> },
              { value: 'TERM', label: 'Term Exam', icon: <Hash size={18} /> },
              { value: 'MOCK', label: 'Mock Test', icon: <Shuffle size={18} /> },
              { value: 'RETRY', label: 'Retry Wrong', icon: <Play size={18} /> },
            ].map((m) => (
              <button key={m.value} onClick={() => setMode(m.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  mode === m.value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-200 text-gray-600'
                }`}>
                {m.icon}
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chapter Selection */}
        {mode === 'CHAPTER' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Chapter</label>
            <select value={chapterId} onChange={(e) => setChapterId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Choose a chapter...</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>Unit {ch.number}: {ch.title} ({ch.questionCount} Q&apos;s)</option>
              ))}
            </select>
          </div>
        )}

        {/* Term Selection */}
        {mode === 'TERM' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Term Exam</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((t) => (
                <button key={t} onClick={() => setTermExam(String(t))}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    termExam === String(t) ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-200'
                  }`}>
                  Term {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
          <div className="flex gap-3">
            {['MCQ', 'CODING'].map((t) => (
              <button key={t} onClick={() => setQuestionType(t)}
                className={`px-5 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  questionType === t ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-200'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Questions: {questionCount}</label>
          <input type="range" min={5} max={50} step={5} value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>50</span></div>
        </div>

        {/* Timed */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium">Timed Mode</p>
              <p className="text-xs text-gray-400">Add time pressure to your practice</p>
            </div>
          </div>
          <button onClick={() => setTimed(!timed)}
            className={`w-12 h-6 rounded-full transition-colors relative ${timed ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${timed ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {timed && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit: {Math.floor(timeLimit / 60)} min</label>
            <input type="range" min={120} max={3600} step={60} value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-full accent-blue-600" />
          </div>
        )}

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

        <button onClick={startQuiz} disabled={starting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
          {starting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Play size={20} /> Start Quiz</>}
        </button>
      </div>
    </div>
  );
}

export default function QuizSetupPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-8"><div className="h-8 bg-gray-200 rounded w-48 animate-pulse" /></div>}>
      <QuizSetupContent />
    </Suspense>
  );
}
