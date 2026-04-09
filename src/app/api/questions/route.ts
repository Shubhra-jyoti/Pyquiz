import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get('chapterId');
  const type = searchParams.get('type');
  const termExam = searchParams.get('termExam');
  const difficulty = searchParams.get('difficulty');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const bookmarked = searchParams.get('bookmarked');

  const where: any = { published: true };

  if (chapterId) where.chapterId = parseInt(chapterId);
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search) where.questionText = { contains: search };

  if (termExam) {
    where.chapter = { termExam: parseInt(termExam) };
  }

  if (bookmarked === 'true') {
    where.bookmarks = { some: { userId: user.id } };
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        options: true,
        chapter: true,
        verification: true,
        bookmarks: { where: { userId: user.id } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { srNo: 'asc' },
    }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({
    questions: questions.map((q) => ({
      ...q,
      isBookmarked: q.bookmarks.length > 0,
      bookmarks: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
