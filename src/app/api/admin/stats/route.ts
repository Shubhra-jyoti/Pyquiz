import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalQuestions, totalUsers, totalAttempts, needsReview] = await Promise.all([
    prisma.question.count(),
    prisma.user.count(),
    prisma.quizAttempt.count({ where: { completedAt: { not: null } } }),
    prisma.question.count({ where: { confidence: { lt: 0.8 } } }),
  ]);

  return NextResponse.json({ totalQuestions, totalUsers, totalAttempts, needsReview });
}
