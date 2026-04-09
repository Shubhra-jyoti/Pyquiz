import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash,
        displayName: username,
        role: 'STUDENT',
      },
      select: { id: true, username: true, email: true, role: true, displayName: true },
    });

    const token = generateToken(user.id, user.role);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set('pyquiz-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
