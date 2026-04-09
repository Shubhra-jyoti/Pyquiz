import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get progress snapshots
  const progress = await prisma.progressSnapshot.findMany({
    where: { userId: user.id },
    include: { chapter: true },
    orderBy: { chapterId: 'asc' },
  });

  // Get recent quiz attempts
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  // Get all chapters
  const chapters = await prisma.chapter.findMany({ orderBy: { number: 'asc' } });

  // Calculate overall stats
  const totalAttempted = progress.reduce((sum, p) => sum + p.totalAttempted, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.totalCorrect, 0);
  const overallAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  // Term readiness
  const termReadiness: Record<number, number> = {};
  for (let t = 1; t <= 4; t++) {
    const termProgress = progress.filter(p => p.chapter.termExam === t);
    if (termProgress.length === 0) {
      termReadiness[t] = 0;
    } else {
      termReadiness[t] = termProgress.reduce((sum, p) => sum + p.mastery, 0) / termProgress.length;
    }
  }

  // Weak chapters
  const weakChapters = progress
    .filter(p => p.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery)
    .map(p => ({ chapterId: p.chapterId, title: p.chapter.title, mastery: p.mastery }));

  // Chapters with no attempts yet
  const attemptedChapters = new Set(progress.map(p => p.chapterId));
  const notStarted = chapters.filter(c => !attemptedChapters.has(c.id));

  return NextResponse.json({
    progress: progress.map(p => ({
      chapterId: p.chapterId,
      chapterTitle: p.chapter.title,
      termExam: p.chapter.termExam,
      mcqAccuracy: p.mcqAccuracy,
      codingAccuracy: p.codingAccuracy,
      totalAttempted: p.totalAttempted,
      totalCorrect: p.totalCorrect,
      mastery: p.mastery,
      streak: p.streak,
      lastPracticed: p.lastPracticed,
    })),
    overallAccuracy,
    totalQuizzes: recentAttempts.length,
    totalAttempted,
    totalCorrect,
    termReadiness,
    weakChapters,
    notStarted: notStarted.map(c => ({ id: c.id, title: c.title, termExam: c.termExam })),
    recentAttempts: recentAttempts.map(a => ({
      id: a.id,
      mode: a.mode,
      score: a.score,
      correctCount: a.correctCount,
      totalQuestions: a.totalQuestions,
      completedAt: a.completedAt,
    })),
  });
}
