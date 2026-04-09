'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, Code2, BarChart3, Brain, Shield, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();

  if (!loading && user) redirect('/dashboard');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-blue-100 text-sm mb-6">
              <Zap size={14} />
              Python-II Sem IV Practice Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Master Python<br />
              <span className="text-blue-200">One Question at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              503+ practice questions from your practice book — MCQs, coding challenges, chapter-wise progress tracking, and AI-powered feedback. Built for LJU students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                Start Practicing <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="px-8 py-3.5 text-white border-2 border-white/30 font-semibold rounded-xl hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { label: 'MCQ Questions', value: '366+' },
              { label: 'Coding Problems', value: '136+' },
              { label: 'Chapters', value: '10' },
              { label: 'Term Exams', value: '4' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Ace Your Exams</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Practice smart with chapter-wise quizzes, instant feedback, and progress tracking</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<BookOpen className="text-blue-600" size={28} />} title="Chapter-wise MCQs" desc="366+ MCQs organized by chapter and term exam. Instant scoring with explanations." />
            <FeatureCard icon={<Code2 className="text-blue-600" size={28} />} title="Coding Practice" desc="136+ coding questions with in-browser Python editor. Write, run, and submit code." />
            <FeatureCard icon={<BarChart3 className="text-blue-600" size={28} />} title="Progress Tracking" desc="Track accuracy by chapter, see weak areas, and monitor term exam readiness." />
            <FeatureCard icon={<Brain className="text-blue-600" size={28} />} title="AI Feedback" desc="Get AI-powered code review, MCQ verification, and personalized study recommendations." />
            <FeatureCard icon={<Shield className="text-blue-600" size={28} />} title="Practice Book Accurate" desc="Questions extracted directly from your practice book with source page references." />
            <FeatureCard icon={<CheckCircle2 className="text-blue-600" size={28} />} title="Quiz Modes" desc="Chapter quiz, term exam mock, mixed mode, timed/untimed, and retry incorrect questions." />
          </div>
        </div>
      </section>

      {/* Chapters Preview */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">10 Chapters Across 4 Term Exams</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { term: 1, chapters: ['Pandas - Data Cleaning & Manipulation', 'Data Visualization', 'NumPy & Data Processing'] },
              { term: 2, chapters: ['Machine Learning Basics', 'ML Algorithms (kNN, SVM, Decision Trees)', 'Deep Learning & Keras'] },
              { term: 3, chapters: ['Web Scraping & APIs', 'Django Basics'] },
              { term: 4, chapters: ['Django Forms & Authentication', 'Django REST Framework'] },
            ].map((t) => (
              <div key={t.term} className="bg-white rounded-xl p-6 border border-[var(--border)] card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                    T{t.term}
                  </div>
                  <h3 className="font-semibold text-lg">Term Exam {t.term}</h3>
                </div>
                <ul className="space-y-2">
                  {t.chapters.map((ch, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />
                      {ch}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start practicing?</h2>
          <p className="text-blue-100 mb-8">Create a free account and start your exam preparation today.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center text-gray-400 text-sm">
        <p>PyQuiz — Built for LJU Python-II Sem IV Students</p>
        <p className="mt-1">Practice Book Reference Only. Not affiliated with L.J. University.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-[var(--border)] card-hover">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
