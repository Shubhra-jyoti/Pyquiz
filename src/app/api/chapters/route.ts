import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chapters = await prisma.chapter.findMany({
    orderBy: { number: 'asc' },
  });

  return NextResponse.json({ chapters });
}
