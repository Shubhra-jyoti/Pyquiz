'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bookmark, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loadingB, setLoadingB] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/bookmarks').then(r => r.json()).then(d => {
        setBookmarks(d.bookmarks || []);
        setLoadingB(false);
      });
    }
  }, [user]);

  const removeBookmark = async (questionId: string) => {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    });
    setBookmarks(prev => prev.filter(b => b.questionId !== questionId));
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><Bookmark className="text-amber-500" /> Bookmarked Questions</h1>
      <p className="text-gray-500 mb-6">{bookmarks.length} saved questions</p>

      {loadingB ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : bookmarks.length > 0 ? (
        <div className="space-y-3">
          {bookmarks.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-[var(--border)] p-5 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    Unit {b.question.chapter?.number}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {b.question.type}
                  </span>
                </div>
                <p className="text-sm text-gray-800 line-clamp-2">{b.question.questionText}</p>
              </div>
              <button onClick={() => removeBookmark(b.questionId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Bookmark size={48} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">No bookmarks yet</p>
          <Link href="/quiz/setup" className="text-blue-600 text-sm hover:underline">Start a quiz to bookmark questions</Link>
        </div>
      )}
    </div>
  );
}
