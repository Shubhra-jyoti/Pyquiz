import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionId, code, output } = await req.json();
  if (!questionId || !code) return NextResponse.json({ error: 'questionId and code required' }, { status: 400 });

  // Count existing submissions for attempt number
  const count = await prisma.submission.count({ where: { userId: user.id, questionId } });

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      questionId,
      code,
      output: output || '',
      attemptNumber: count + 1,
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get('questionId');

  const where: any = { userId: user.id };
  if (questionId) where.questionId = questionId;

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({ submissions });
}
