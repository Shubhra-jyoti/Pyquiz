import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, questionText, published, chapterId, difficulty, attachments } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const updateData: any = {};
  if (questionText !== undefined) updateData.questionText = questionText;
  if (published !== undefined) updateData.published = published;
  if (chapterId !== undefined) updateData.chapterId = chapterId;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (attachments !== undefined) updateData.attachments = attachments as any;

  const updated = await prisma.question.update({
    where: { id },
    data: updateData,
  });

  await prisma.adminReviewLog.create({
    data: {
      adminId: user.id,
      questionId: id,
      action: 'EDIT_QUESTION',
      details: JSON.stringify(updateData),
    },
  });

  return NextResponse.json({ question: updated });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await req.json();
    const { chapterId, questionText, type, marks, options, bookAnswer, attachments } = data;

    if (!chapterId || !questionText || !type || !marks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine next srNo
    const lastQ = await prisma.question.findFirst({
      orderBy: { srNo: 'desc' }
    });
    const nextSrNo = (lastQ?.srNo || 0) + 1;

    let createdOptions;
    if (type === 'MCQ' && options && options.length > 0) {
      createdOptions = {
        create: options.map((opt: any) => ({
          label: opt.label,
          text: opt.text,
          isCorrect: opt.label === bookAnswer,
        }))
      };
    }

    const question = await prisma.question.create({
      data: {
        srNo: nextSrNo,
        chapterId,
        questionText,
        type,
        marks: parseInt(marks),
        confidence: 1.0,
        published: true,
        attachments: (attachments as any) || null,
        options: createdOptions,
        verification: {
          create: {
            bookAnswer: bookAnswer || '',
            adminFinalAnswer: bookAnswer || null,
          }
        }
      },
      include: {
        options: true,
        chapter: true,
      }
    });

    await prisma.adminReviewLog.create({
      data: {
        adminId: user.id,
        questionId: question.id,
        action: 'CREATED_QUESTION',
        details: JSON.stringify({ type, marks }),
      },
    });

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error('Question creation error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
