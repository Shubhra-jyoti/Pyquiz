'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionText from '@/components/QuestionText';
import { Play, Send, Bot, Copy, Check, ArrowLeft, BookOpen, Loader2, Code2, Star } from 'lucide-react';

export default function CodingPracticePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [code, setCode] = useState('# Write your Python code here\n\n');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);
  const [aiSolution, setAiSolution] = useState<string>('');
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/questions?limit=500&type=CODING`).then(r => r.json()).then(data => {
      const q = data.questions?.find((q: any) => q.id === questionId);
      if (q) setQuestion(q);
    });
  }, [user, questionId]);

  // Load Pyodide
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
    script.onload = async () => {
      try {
        const pyodideInstance = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
        });
        setPyodide(pyodideInstance);
        setPyodideReady(true);
      } catch (err) {
        console.error('Pyodide load error:', err);
      }
    };
    document.head.appendChild(script);
  }, []);

  const runCode = async () => {
    if (!pyodideReady || !pyodide) {
      setOutput('⏳ Python runtime is loading... please wait.');
      return;
    }
    setRunning(true);
    setOutput('');
    try {
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
      pyodide.runPython(code);
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      const stderr = pyodide.runPython('sys.stderr.getvalue()');
      setOutput(stdout + (stderr ? '\n⚠️ ' + stderr : ''));
    } catch (err: any) {
      setOutput('❌ Error: ' + (err.message || String(err)));
    }
    setRunning(false);
  };

  const submitCode = async () => {
    if (!user || !question) return;
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, code, output }),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {}
  };

  const reviewWithAI = async () => {
    if (!question) return;
    setLoadingReview(true);
    setAiReview(null);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, code, output }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiReview(data);
      } else {
        setAiReview({ error: data.error || 'Review failed' });
      }
    } catch {
      setAiReview({ error: 'Network error' });
    }
    setLoadingReview(false);
  };

  const getAISolution = async () => {
    if (!question) return;
    setLoadingSolution(true);
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, action: 'solution' }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiSolution(data.solution);
        setShowSolution(true);
      }
    } catch {}
    setLoadingSolution(false);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setCode(code.substring(0, start) + '    ' + code.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Code2 size={18} className="text-blue-600 flex-shrink-0" /> Coding Practice
          </h1>
          {question && (
            <p className="text-xs text-gray-400 truncate">
              Unit {question.chapter?.number} • {question.marks} marks • Sr#{question.srNo}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left - Question + Output */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Question</span>
            </div>
            {question ? (
              <QuestionText text={question.questionText} />
            ) : (
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
            )}
          </div>

          {/* Output */}
          <div className="bg-[#1e293b] rounded-2xl p-4 sm:p-5 min-h-[100px] sm:min-h-[120px]">
            <p className="text-xs text-gray-400 mb-2 font-mono">OUTPUT</p>
            <pre className="text-xs sm:text-sm text-green-400 font-mono whitespace-pre-wrap break-words">
              {output || '// Run your code to see output here'}
            </pre>
          </div>

          {/* AI Review */}
          {aiReview && !aiReview.error && (
            <div className="bg-white rounded-2xl border border-blue-200 p-4 sm:p-6 fade-in">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Bot size={18} className="text-blue-600" />
                <span className="font-semibold text-blue-600">AI Review</span>
                {aiReview.score !== undefined && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                    aiReview.score >= 80 ? 'bg-green-100 text-green-700' : aiReview.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <Star size={12} /> {aiReview.score}/100
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-3">{aiReview.feedback}</p>
              {aiReview.improvements?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Improvements:</p>
                  <ul className="space-y-1">
                    {aiReview.improvements.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {aiReview?.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{aiReview.error}</div>
          )}

          {/* AI Solution */}
          {showSolution && aiSolution && (
            <div className="bg-white rounded-2xl border border-green-200 p-4 sm:p-6 fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-green-700 flex items-center gap-2">
                  <Bot size={16} /> AI Solution
                </span>
                <button onClick={() => copyCode(aiSolution)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">{aiSolution}</pre>
            </div>
          )}
        </div>

        {/* Right - Code Editor */}
        <div className="space-y-4">
          <div className="code-editor-container">
            <div className="bg-[#1e293b] px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">main.py</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0f172a] text-gray-100 font-mono text-xs sm:text-sm p-3 sm:p-4 outline-none resize-none"
              style={{ minHeight: '300px', tabSize: 4 }}
              spellCheck={false}
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={runCode} disabled={running || !pyodideReady}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 text-sm">
              {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {running ? 'Running...' : pyodideReady ? 'Run' : 'Loading...'}
            </button>
            <button onClick={submitCode}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm">
              {submitted ? <Check size={16} /> : <Send size={16} />}
              {submitted ? 'Saved!' : 'Submit'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={reviewWithAI} disabled={loadingReview || !code.trim()}
              className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-blue-300 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50">
              {loadingReview ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              {loadingReview ? 'Reviewing...' : 'AI Review'}
            </button>
            <button onClick={getAISolution} disabled={loadingSolution}
              className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-green-300 text-green-700 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50">
              {loadingSolution ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              {loadingSolution ? 'Generating...' : 'AI Solution'}
            </button>
          </div>

          {!pyodideReady && (
            <div className="text-center p-3 bg-blue-50 rounded-xl text-xs sm:text-sm text-blue-600 flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Loading Python runtime (Pyodide)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
