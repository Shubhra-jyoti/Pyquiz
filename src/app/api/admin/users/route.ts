import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, displayName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}
