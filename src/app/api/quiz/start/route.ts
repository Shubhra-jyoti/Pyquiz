import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { shuffleArray } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { mode, chapterId, termExam, questionCount = 10, timed = false, timeLimit, questionType } = body;

    const where: any = { published: true };

    if (questionType) where.type = questionType;

    switch (mode) {
      case 'CHAPTER':
        if (!chapterId) return NextResponse.json({ error: 'chapterId required' }, { status: 400 });
        where.chapterId = chapterId;
        break;
      case 'TERM':
        if (!termExam) return NextResponse.json({ error: 'termExam required' }, { status: 400 });
        where.chapter = { termExam };
        break;
      case 'MOCK':
      case 'MIXED':
        break;
      case 'RETRY':
        // Get questions the user got wrong
        const wrongResponses = await prisma.quizResponse.findMany({
          where: { attempt: { userId: user.id }, isCorrect: false },
          select: { questionId: true },
          distinct: ['questionId'],
        });
        where.id = { in: wrongResponses.map(r => r.questionId) };
        break;
    }

    // Fetch questions
    let questions = await prisma.question.findMany({
      where,
      include: {
        options: true,
        chapter: true,
      },
      orderBy: { srNo: 'asc' },
    });

    // Shuffle and limit
    questions = shuffleArray(questions).slice(0, Math.min(questionCount, questions.length));

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        mode,
        chapterId: chapterId || null,
        termExam: termExam || null,
        totalQuestions: questions.length,
        timed,
        timeLimit: timeLimit || null,
      },
    });

    // Return questions without correct answers
    const sanitized = questions.map(q => ({
      ...q,
      options: q.options.map(o => ({
        id: o.id,
        label: o.label,
        text: o.text,
      })),
    }));

    return NextResponse.json({
      attemptId: attempt.id,
      questions: sanitized,
      timed,
      timeLimit,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Quiz start error:', error);
    return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 });
  }
}
