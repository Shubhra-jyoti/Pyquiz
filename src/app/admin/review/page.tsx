'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminReviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') router.push('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/review').then(r => r.ok ? r.json() : { questions: [] }).then(d => {
        setQuestions(d.questions || []);
        setLoadingQ(false);
      }).catch(() => setLoadingQ(false));
    }
  }, [user]);

  const approveAnswer = async (questionId: string, answer: string) => {
    await fetch('/api/admin/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, adminFinalAnswer: answer, adminApproved: true }),
    });
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  if (loading || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <AlertTriangle className="text-amber-500" /> Review Queue
      </h1>
      <p className="text-gray-500 mb-6">
        Review low-confidence questions and AI verification conflicts
      </p>

      {loadingQ ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="bg-white rounded-xl border border-amber-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    Unit {q.chapter?.number} • Sr#{q.srNo}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    q.confidence >= 0.8 ? 'bg-green-50 text-green-600' : q.confidence >= 0.5 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                  }`}>
                    Confidence: {(q.confidence * 100).toFixed(0)}%
                  </span>
                  {q.verification?.aiVerification === 'POSSIBLY_INCORRECT' && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">AI Disagrees</span>
                  )}
                </div>
              </div>

              <p className="text-sm whitespace-pre-wrap mb-4">{q.questionText}</p>

              {q.type === 'MCQ' && q.options && (
                <div className="space-y-2 mb-4">
                  {q.options.map((opt: any) => (
                    <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                      opt.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}>
                      <span className="font-bold w-6">{opt.label})</span>
                      <span>{opt.text}</span>
                      {opt.isCorrect && <CheckCircle size={14} className="text-green-600 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}

              {q.verification && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
                  <p><strong>Practice Book Answer:</strong> {q.verification.bookAnswer}</p>
                  <p><strong>AI Verification:</strong> {q.verification.aiVerification}</p>
                  {q.verification.aiExplanation && <p className="mt-1 text-gray-600">{q.verification.aiExplanation}</p>}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => approveAnswer(q.id, q.verification?.bookAnswer || '')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1">
                  <CheckCircle size={14} /> Approve Book Answer
                </button>
                {q.options?.map((opt: any) => (
                  opt.label !== q.verification?.bookAnswer && (
                    <button key={opt.label} onClick={() => approveAnswer(q.id, opt.label)}
                      className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">
                      Set {opt.label} as correct
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p>All caught up! No items need review.</p>
        </div>
      )}
    </div>
  );
}
