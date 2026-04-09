'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { formatTime } from '@/lib/utils';
import QuestionText from '@/components/QuestionText';
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle,
  Bookmark, Flag, ArrowRight, Trophy, RotateCcw, Bot, Loader2
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  srNo: number;
  questionText: string;
  type: string;
  marks: number;
  chapter?: { title: string; number: number };
  options: { id: string; label: string; text: string }[];
}

interface QuizData {
  attemptId: string;
  questions: QuizQuestion[];
  timed: boolean;
  timeLimit?: number;
  totalQuestions: number;
}

export default function QuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const attemptId = params.id as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [aiVerifying, setAiVerifying] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem('quizData');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.attemptId === attemptId) {
        setQuizData(data);
        if (data.timed && data.timeLimit) setTimeLeft(data.timeLimit);
      }
    }
  }, [attemptId]);

  useEffect(() => {
    if (!quizData?.timed || timeLeft <= 0 || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizData?.timed, timeLeft, submitted]);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted || !quizData) return;
    setSubmitting(true);

    const responses = quizData.questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] || null,
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          responses,
          timeTaken: quizData.timed && quizData.timeLimit ? quizData.timeLimit - timeLeft : null,
        }),
      });
      const data = await res.json();
      setResults(data);
      setSubmitted(true);

      for (const qId of bookmarked) {
        fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: qId }),
        });
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  }, [quizData, answers, attemptId, timeLeft, submitting, submitted, bookmarked]);

  const toggleBookmark = (qId: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const toggleFlag = (qId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const verifyWithAI = async (questionId: string) => {
    setAiVerifying(prev => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      setAiResults(prev => ({ ...prev, [questionId]: data }));
    } catch (err) {
      setAiResults(prev => ({ ...prev, [questionId]: { error: 'AI verification failed' } }));
    }
    setAiVerifying(prev => ({ ...prev, [questionId]: false }));
  };

  if (loading || !user || !quizData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
    );
  }

  const question = quizData.questions[currentIdx];
  const answered = Object.keys(answers).length;

  // Results screen
  if (submitted && results) {
    if (results.error) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
            <XCircle size={48} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Submission Failed</h1>
            <p>{results.error}</p>
            <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 sm:p-8 text-center mb-8">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            (results.score || 0) >= 70 ? 'bg-green-100' : (results.score || 0) >= 40 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Trophy size={32} className={(results.score || 0) >= 70 ? 'text-green-600' : (results.score || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-2">{(results.score || 0).toFixed(0)}%</p>
          <p className="text-gray-500">{results.correctCount} of {results.totalQuestions} correct</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button onClick={() => setShowReview(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Review Answers
            </button>
            <button onClick={() => router.push('/quiz/setup')}
              className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <RotateCcw size={16} /> New Quiz
            </button>
          </div>
        </div>

        {showReview && (
          <div className="space-y-4 fade-in">
            <h2 className="text-xl font-bold mb-4">Answer Review</h2>
            {quizData.questions.map((q, idx) => {
              const result = results.results?.find((r: any) => r.questionId === q.id);
              const ai = aiResults[q.id];
              return (
                <div key={q.id} className={`bg-white rounded-xl border-2 p-4 sm:p-5 ${result?.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded flex-shrink-0 ${result?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Q{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <QuestionText text={q.questionText} />
                    </div>
                  </div>

                  <div className="ml-0 sm:ml-8 space-y-1.5">
                    {q.options.map(opt => {
                      const isSelected = answers[q.id] === opt.label;
                      const isCorrect = opt.label === result?.correctAnswer;
                      let cls = 'border-gray-100 bg-gray-50';
                      if (isCorrect) cls = 'border-green-300 bg-green-50';
                      else if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50';
                      return (
                        <div key={opt.id} className={`flex items-start gap-2 p-2.5 rounded-lg border text-sm ${cls}`}>
                          <span className="font-semibold w-6 flex-shrink-0">{opt.label})</span>
                          <span className="flex-1 break-words">{opt.text}</span>
                          {isCorrect && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />}
                          {isSelected && !isCorrect && <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {result?.bookAnswer && (
                    <p className="ml-0 sm:ml-8 mt-2 text-xs text-gray-500">
                      Practice Book Answer: <strong>{result.bookAnswer}</strong>
                    </p>
                  )}

                  {/* AI Verify Button */}
                  <div className="ml-0 sm:ml-8 mt-3">
                    {!ai ? (
                      <button onClick={() => verifyWithAI(q.id)} disabled={aiVerifying[q.id]}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-200">
                        {aiVerifying[q.id] ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                        {aiVerifying[q.id] ? 'Verifying...' : 'Verify with AI'}
                      </button>
                    ) : ai.error ? (
                      <div className="p-3 bg-red-50 rounded-lg text-sm text-red-600">{ai.error}</div>
                    ) : (
                      <div className={`p-3 rounded-lg text-sm border ${ai.agrees ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Bot size={14} className={ai.agrees ? 'text-green-600' : 'text-amber-600'} />
                          <span className="font-semibold">
                            AI says: {ai.aiAnswer}
                            {ai.agrees ? (
                              <span className="text-green-600 ml-2">✓ Agrees with book</span>
                            ) : (
                              <span className="text-amber-600 ml-2">⚠ Disagrees (book: {ai.bookAnswer})</span>
                            )}
                          </span>
                        </div>
                        <p className="text-gray-600">{ai.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Quiz-taking screen
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 bg-white rounded-xl border border-[var(--border)] p-2.5 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm font-medium text-gray-500">
            Q {currentIdx + 1}/{quizData.totalQuestions}
          </span>
          <span className="hidden sm:inline text-xs text-gray-400">
            {answered}/{quizData.totalQuestions} answered
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {quizData.timed && (
            <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-medium ${
              timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button onClick={() => { if (confirm('Submit quiz now?')) handleSubmit(); }}
            className="px-3 sm:px-4 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Submit
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 fade-in" key={question.id}>
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div>
            {question.chapter && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                U{question.chapter.number}: {question.chapter.title}
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => toggleBookmark(question.id)}
              className={`p-1.5 rounded-lg transition-colors ${bookmarked.has(question.id) ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500'}`}>
              <Bookmark size={16} fill={bookmarked.has(question.id) ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => toggleFlag(question.id)}
              className={`p-1.5 rounded-lg transition-colors ${flagged.has(question.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}>
              <Flag size={16} fill={flagged.has(question.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <QuestionText text={question.questionText} />
        </div>

        {/* Options */}
        <div className="space-y-2 sm:space-y-3">
          {question.options.map(opt => (
            <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt.label }))}
              className={`quiz-option w-full text-left flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                answers[question.id] === opt.label
                  ? 'selected border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-blue-200'
              }`}>
              <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 ${
                answers[question.id] === opt.label ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {opt.label}
              </span>
              <span className="text-xs sm:text-sm break-words whitespace-pre-wrap">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
          <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Question dots - scrollable on mobile */}
        <div className="flex gap-1 sm:gap-1.5 flex-wrap justify-center max-w-[200px] sm:max-w-md overflow-hidden">
          {quizData.questions.map((q, idx) => (
            <button key={q.id} onClick={() => setCurrentIdx(idx)}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                idx === currentIdx ? 'bg-blue-600 text-white' :
                answers[q.id] ? 'bg-blue-100 text-blue-600' :
                flagged.has(q.id) ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-500'
              }`}>
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIdx < quizData.totalQuestions - 1 ? (
          <button onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={() => { if (confirm('Submit quiz?')) handleSubmit(); }} disabled={submitting}
            className="flex items-center gap-1 px-4 sm:px-5 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
            {submitting ? 'Submitting...' : <>Finish <ArrowRight size={16} /></>}
          </button>
        )}
      </div>
    </div>
  );
}
