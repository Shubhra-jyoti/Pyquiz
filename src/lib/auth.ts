import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'pyquiz-secret';

export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(password, hash);
}

export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('pyquiz-token')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, email: true, role: true, displayName: true },
  });
  
  return user;
}

export function requireAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, user);
  };
}

export function requireAdmin(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(req, user);
  };
}
