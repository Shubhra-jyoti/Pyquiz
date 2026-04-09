import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { reviewCode, generateSolution } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { questionId, code, output, action } = await req.json();
    if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    if (action === 'solution') {
      const solution = await generateSolution(question.questionText);
      return NextResponse.json({ solution });
    }

    // Default: review code
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

    const result = await reviewCode(question.questionText, code, output || '');

    // Save AI feedback to submission
    await prisma.submission.updateMany({
      where: { userId: user.id, questionId, code },
      data: { aiFeedback: result.feedback, aiScore: result.score },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI review error:', error);
    return NextResponse.json({ error: error.message || 'AI review failed' }, { status: 500 });
  }
}
