import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionId, note } = await req.json();
  if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: { userId: user.id, questionId, note },
  });

  return NextResponse.json({ bookmarked: true });
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      question: {
        include: { chapter: true, options: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ bookmarks });
}
