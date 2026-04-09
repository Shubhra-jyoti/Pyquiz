import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { attemptId, responses, timeTaken } = await req.json();

    // Verify attempt belongs to user
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 });
    }

    if (attempt.completedAt) {
      return NextResponse.json({ error: 'Quiz already submitted' }, { status: 400 });
    }

    let correctCount = 0;
    const results = [];

    for (const resp of responses) {
      const { questionId, selectedOption, timeTaken: qTime } = resp;

      // Get the correct answer
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true, verification: true },
      });

      if (!question) continue;

      let isCorrect = false;
      let correctAnswer = '';

      if (question.type === 'MCQ') {
        const correctOpt = question.options.find(o => o.isCorrect);
        correctAnswer = correctOpt?.label || '';
        isCorrect = selectedOption === correctAnswer;

        // Also check verification - prefer admin final answer if exists
        if (question.verification?.adminFinalAnswer) {
          isCorrect = selectedOption === question.verification.adminFinalAnswer;
          correctAnswer = question.verification.adminFinalAnswer;
        }
      }

      if (isCorrect) correctCount++;

      // Save response
      await prisma.quizResponse.create({
        data: {
          attemptId,
          questionId,
          selectedOption,
          isCorrect,
          timeTaken: qTime,
        },
      });

      results.push({
        questionId,
        selectedOption,
        isCorrect,
        correctAnswer,
        bookAnswer: question.verification?.bookAnswer,
        aiVerification: question.verification?.aiVerification,
      });
    }

    const score = responses.length > 0 ? (correctCount / responses.length) * 100 : 0;

    // Update attempt
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        correctCount,
        score,
        timeTaken,
        completedAt: new Date(),
      },
    });

    // Update progress snapshots
    const questionChapters = await prisma.question.findMany({
      where: { id: { in: responses.map((r: any) => r.questionId) } },
      select: { id: true, chapterId: true, type: true },
    });

    const chapterMap = new Map<number, { attempted: number; correct: number }>();
    for (const qc of questionChapters) {
      const resp = results.find(r => r.questionId === qc.id);
      if (!chapterMap.has(qc.chapterId)) {
        chapterMap.set(qc.chapterId, { attempted: 0, correct: 0 });
      }
      const entry = chapterMap.get(qc.chapterId)!;
      entry.attempted++;
      if (resp?.isCorrect) entry.correct++;
    }

    for (const [chapId, stats] of chapterMap) {
      const existing = await prisma.progressSnapshot.findUnique({
        where: { userId_chapterId: { userId: user.id, chapterId: chapId } },
      });

      const totalAttempted = (existing?.totalAttempted || 0) + stats.attempted;
      const totalCorrect = (existing?.totalCorrect || 0) + stats.correct;
      const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

      await prisma.progressSnapshot.upsert({
        where: { userId_chapterId: { userId: user.id, chapterId: chapId } },
        update: {
          totalAttempted,
          totalCorrect,
          mcqAccuracy: accuracy,
          mastery: Math.min(100, accuracy * 0.8 + (totalAttempted > 10 ? 20 : totalAttempted * 2)),
          lastPracticed: new Date(),
          streak: (existing?.streak || 0) + 1,
        },
        create: {
          userId: user.id,
          chapterId: chapId,
          totalAttempted: stats.attempted,
          totalCorrect: stats.correct,
          mcqAccuracy: stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0,
          mastery: 0,
          lastPracticed: new Date(),
          streak: 1,
        },
      });
    }

    return NextResponse.json({
      attemptId,
      score,
      correctCount,
      totalQuestions: responses.length,
      results,
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
