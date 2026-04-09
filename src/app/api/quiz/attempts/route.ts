import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({ attempts });
}
