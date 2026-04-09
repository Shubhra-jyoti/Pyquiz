import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const questions = await prisma.question.findMany({
    where: {
      OR: [
        { confidence: { lt: 0.8 } },
        { verification: { aiVerification: { in: ['POSSIBLY_INCORRECT', 'AMBIGUOUS'] }, adminApproved: false } },
      ],
    },
    include: { options: true, chapter: true, verification: true },
    orderBy: { confidence: 'asc' },
    take: 50,
  });

  return NextResponse.json({ questions });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { questionId, adminFinalAnswer, adminApproved } = await req.json();

  await prisma.mCQVerification.update({
    where: { questionId },
    data: { adminFinalAnswer, adminApproved, reviewedAt: new Date(), reviewedBy: user.id },
  });

  await prisma.adminReviewLog.create({
    data: {
      adminId: user.id,
      questionId,
      action: 'APPROVE_ANSWER',
      details: `Final answer set to ${adminFinalAnswer}`,
    },
  });

  return NextResponse.json({ success: true });
}
