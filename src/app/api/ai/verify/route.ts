import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { verifyMCQ } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { questionId } = await req.json();
    if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true, verification: true },
    });

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    if (question.type !== 'MCQ') return NextResponse.json({ error: 'Not an MCQ' }, { status: 400 });

    const bookAnswer = question.verification?.bookAnswer || question.options.find(o => o.isCorrect)?.label || '';
    
    const result = await verifyMCQ(
      question.questionText,
      question.options.map(o => ({ label: o.label, text: o.text })),
      bookAnswer
    );

    // Update verification record
    if (question.verification) {
      await prisma.mCQVerification.update({
        where: { questionId },
        data: {
          aiVerification: result.agrees ? 'CONFIRMED' : 'POSSIBLY_INCORRECT',
          aiExplanation: result.explanation,
        },
      });
    }

    return NextResponse.json({
      aiAnswer: result.aiAnswer,
      bookAnswer,
      agrees: result.agrees,
      explanation: result.explanation,
    });
  } catch (error: any) {
    console.error('AI verify error:', error);
    return NextResponse.json({ error: error.message || 'AI verification failed' }, { status: 500 });
  }
}
